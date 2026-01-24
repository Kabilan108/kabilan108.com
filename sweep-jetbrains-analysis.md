# Sweep AI JetBrains Plugin Analysis

> Comprehensive analysis of the Sweep AI Autocomplete & Coding Agent plugin for JetBrains IDEs.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Plugin Architecture Overview](#plugin-architecture-overview)
3. [Context Building Strategy](#context-building-strategy)
4. [Prompt Format](#prompt-format)
5. [Inference Engine](#inference-engine)
6. [Key Features](#key-features)
7. [Performance Optimizations](#performance-optimizations)
8. [Lessons for Neovim Implementation](#lessons-for-neovim-implementation)

---

## Executive Summary

Sweep is a JetBrains-exclusive AI coding assistant that combines autocomplete with a coding agent. Their key differentiator is **next-edit autocomplete** - predicting what you'll change next based on your recent edits, not just your cursor position.

Key technical highlights:
- **1.5B parameter model** that beats models 4x its size
- **Sub-100ms latency** using custom inference engine (TensorRT-LLM)
- **PSI-based context** leveraging JetBrains' Program Structure Interface
- **Simple original/updated diff format** discovered through genetic algorithm testing
- **Local inference option** with GGUF quantized model (1.54 GB)

---

## Plugin Architecture Overview

### High-Level Components

```
+-------------------+     +-------------------+     +-------------------+
|  JetBrains IDE    |     |   Sweep Plugin    |     |  Inference Server |
|                   |     |                   |     |                   |
| +---------------+ |     | +---------------+ |     | +---------------+ |
| |     PSI       |<----->| | Context       | |     | | TensorRT-LLM  | |
| | (Code Model)  | |     | | Builder       |<----->| | vLLM          | |
| +---------------+ |     | +---------------+ |     | | (H100 GPUs)   | |
|                   |     |                   |     | +---------------+ |
| +---------------+ |     | +---------------+ |     +-------------------+
| |    Editor     |<----->| | Completion    | |
| |   Events      | |     | | Provider      | |     +-------------------+
| +---------------+ |     | +---------------+ |     |   Local Model     |
|                   |     |                   |     | (sweep-next-edit  |
| +---------------+ |     | +---------------+ |     |  -1.5B GGUF)      |
| |   Linter/     |<----->| | Agent         | |     +-------------------+
| |   Test Runner | |     | | Controller    | |
| +---------------+ |     | +---------------+ |
+-------------------+     +-------------------+
```

### Core Modules

1. **Context Builder**: Extracts relevant code context using PSI
2. **Completion Provider**: Manages autocomplete UI and inline suggestions
3. **Agent Controller**: Orchestrates multi-step tasks (search, edit, test)
4. **Diff Tracker**: Monitors recent edits for next-edit predictions

---

## Context Building Strategy

### The Problem They Solved

Traditional approaches have critical limitations:

| Approach | Issue |
|----------|-------|
| **Vector Search** | Too slow (>100ms), can't distinguish usage vs definition |
| **TF-IDF** | Common terms like "client" appear thousands of times |
| **Full Codebase** | 10k tokens = 100ms latency, quality degrades at scale |

### PSI-Based Context Fetching

Sweep exclusively uses JetBrains' **Program Structure Interface (PSI)** instead of text search:

```kotlin
// Pseudocode based on JetBrains PSI SDK patterns
fun getContextAroundCursor(editor: Editor, psiFile: PsiFile): Context {
    val cursorElement = psiFile.findElementAt(editor.caretModel.offset)

    // Navigate up PSI tree to find meaningful context
    val containingFunction = PsiTreeUtil.getParentOfType(cursorElement, PsiMethod::class.java)
    val containingClass = PsiTreeUtil.getParentOfType(cursorElement, PsiClass::class.java)

    // Get all references and resolve to definitions
    val references = mutableListOf<PsiElement>()
    containingFunction?.accept(object : PsiRecursiveElementVisitor() {
        override fun visitElement(element: PsiElement) {
            element.references.forEach { ref ->
                ref.resolve()?.let { references.add(it) }
            }
            super.visitElement(element)
        }
    })

    return Context(
        currentFunction = containingFunction?.text,
        currentClass = containingClass?.text,
        referencedDefinitions = references.map { it.text }
    )
}
```

### What PSI Provides

1. **Exact definitions**: When typing `client.query(`, PSI resolves `client` to its `DatabaseClient` class definition
2. **Language-agnostic**: Works for any language the IDE has indexed
3. **Cached lookups**: Initial lookup ~30ms, subsequent lookups <1ms
4. **Semantic understanding**: Distinguishes declarations from usages

### Context Components

The final prompt includes:

| Component | Description | Source |
|-----------|-------------|--------|
| **Prefix** | Code before cursor | Editor state |
| **Suffix** | Code after cursor | Editor state |
| **Definitions** | Types, functions referenced in visible code | PSI resolution |
| **Recent Diffs** | Changes from current editing session | Diff tracker |
| **Related Files** | Other files from same commit/edit session | File history |

### Token Budget

Sweep targets **<10,000 tokens** of context to stay within 100ms latency:

```
Network latency:     ~30ms (west coast datacenter)
PSI lookup:          ~1ms (cached)
Context prep:        ~10ms
Inference:           ~50ms (warm KV cache)
UI rendering:        ~10ms
─────────────────────────────
Total:               ~100ms
```

---

## Prompt Format

### Standard FIM Format (Baseline)

Traditional fill-in-the-middle uses special tokens:

```
<|prefix|>def get_car_metadata(car: Car) -> str:
    return f"{<|suffix|>} {car.model} {car.year}"<|middle|>
```

Model outputs: `car.make`

### Next-Edit Format (Sweep's Innovation)

After testing **30+ diff formats** using genetic algorithms, Sweep found that **simple original/updated blocks** outperform unified diffs:

```
<|file_context|>
# file: models/user.py
class User:
    def __init__(self, name: str):
        self.name = name

    def greet(self) -> str:
        return f"Hello, {self.name}"

<|recent_diff|>
<|original|>
    def greet(self) -> str:
        return f"Hello, {self.name}"
<|updated|>
    def greet(self, formal: bool = False) -> str:
        if formal:
            return f"Good day, {self.name}"
        return f"Hello, {self.name}"

<|current_file|>
# file: tests/test_user.py
class TestUser:
    def test_greet(self):
        user = User("Alice")
        assert user.greet() == "Hello, Alice"
        <|cursor|>

<|completion|>
```

Expected output suggests adding:
```python
    def test_greet_formal(self):
        user = User("Alice")
        assert user.greet(formal=True) == "Good day, Alice"
```

### Key Format Discoveries

1. **Original/updated blocks > unified diffs**: Clearer for the model to understand
2. **AST-aware boundaries**: Completions respect syntax structure (SAFIM)
3. **Recent diffs as context**: Enables predicting related changes
4. **Multiple edit locations**: Model can suggest changes away from cursor

---

## Inference Engine

### Architecture Evolution

Sweep progressively optimized their inference stack:

```
Stage 1: vLLM
    └─> +10x decoding speedup with prefix caching

Stage 2: vLLM + FP8 + torch.compile
    └─> +20% additional speedup

Stage 3: TensorRT-LLM (current)
    └─> Fastest, but complex C++ setup
```

### Speculative Decoding

For next-edit completions where >90% of tokens are unchanged:

```
Without speculative decoding:
  Token 1: 200ms → Token 2: 200ms → Token 3: 200ms = 600ms total

With speculative decoding:
  Draft model generates 3 candidates → Target verifies in 1 pass = 250ms total
```

### KV Cache Optimization

```python
# Pseudocode for KV cache reuse
class InferenceEngine:
    def __init__(self):
        self.kv_cache = {}  # Maps prefix hash -> cached KV states

    def generate(self, prompt: str) -> str:
        # Check for cached prefix
        prefix_hash = hash(prompt[:len(prompt)//2])
        if prefix_hash in self.kv_cache:
            # Warm cache: ~10ms TTFT
            cached_states = self.kv_cache[prefix_hash]
            return self._generate_with_cache(prompt, cached_states)
        else:
            # Cold cache: ~30ms TTFT
            return self._generate_full(prompt)
```

### Early Return Strategy

```python
def stream_completion(prompt: str) -> Generator[str, None, None]:
    buffer = ""
    for token in model.generate_stream(prompt):
        buffer += token

        # Check if we have a complete, useful suggestion
        if is_complete_statement(buffer):
            yield buffer
            cancel_generation()  # Save resources
            return

        # Check if suggestion is getting too long
        if len(buffer) > MAX_COMPLETION_LENGTH:
            yield buffer
            cancel_generation()
            return

    yield buffer
```

### Hardware & Datacenter

- **GPUs**: H100s on GCP (3x speedup over previous gen)
- **West Coast Datacenter**: Oregon location reduces latency for US-West users from 143ms to 32ms
- **Result**: 10ms TTFT, 50ms decode time (with warm cache)

---

## Key Features

### 1. Standard Autocomplete (FIM)

- Traditional fill-in-the-middle
- Triggers on every keystroke
- Single-line and multi-line completions

### 2. Next-Edit Autocomplete (Differentiator)

Predicts changes **beyond** cursor position based on recent edits:

| Scenario | Standard Autocomplete | Next-Edit |
|----------|----------------------|-----------|
| Add function param | Completes at cursor | Suggests using param in body |
| Modify function | Completes at cursor | Updates callers automatically |
| Add import | Completes at cursor | Suggests using imported module |

### 3. Tab-to-Jump

Suggests edits at **distant locations** in the file, allowing users to Tab-jump between related changes.

### 4. Agent Mode

Full coding agent capabilities:
- **Codebase search**: Uses dedicated search engine for large repos
- **Multi-file edits**: Applies changes across files
- **Test execution**: Runs tests and interprets results
- **Linter integration**: Uses IDE's built-in linter for validation

### 5. Planning Mode

- Creates detailed implementation plans
- Allows user review before execution
- Iterative refinement

---

## Performance Optimizations

### 1. Latency Budget Management

```
Target: 100ms end-to-end

Breakdown:
├── Network roundtrip:    30ms (optimized datacenter location)
├── PSI context lookup:    1ms (cached after first call)
├── Prompt preparation:   10ms
├── Model inference:      50ms (TTFT + decode)
└── UI rendering:         10ms
```

### 2. Context Selection

| Technique | Benefit |
|-----------|---------|
| PSI over text search | O(1) lookups vs O(n) search |
| Definition-only | No duplicate "usage" references |
| Token budgeting | Stay under 10k for quality |

### 3. Inference Optimizations

| Optimization | Speedup |
|--------------|---------|
| Speculative decoding | 5-10x decode time |
| KV cache reuse | 3x TTFT reduction |
| FP8 quantization | 20% overall |
| TensorRT-LLM | 2-3x over vLLM |
| Early return | Variable (saves compute) |

### 4. Training Optimizations

- **SAFIM (Syntax-Aware FIM)**: Only sample from valid AST nodes
- **AST-diff sampling**: Upsample frequently edited code patterns
- **RL with tree-sitter**: Validate syntactic correctness during training

---

## Lessons for Neovim Implementation

### What to Borrow

#### 1. Context Building Strategy

```lua
-- Neovim equivalent using LSP
local function get_context_for_completion()
    local bufnr = vim.api.nvim_get_current_buf()
    local pos = vim.api.nvim_win_get_cursor(0)

    -- Get definitions using LSP
    local params = vim.lsp.util.make_position_params()

    -- Collect references in visible code
    local definitions = {}
    vim.lsp.buf_request(bufnr, 'textDocument/definition', params, function(err, result)
        if result then
            for _, def in ipairs(result) do
                table.insert(definitions, read_definition(def))
            end
        end
    end)

    return {
        prefix = get_text_before_cursor(),
        suffix = get_text_after_cursor(),
        definitions = definitions,
        recent_diffs = get_recent_changes(),  -- Track with autocmds
    }
end
```

#### 2. Recent Edit Tracking

```lua
-- Track recent edits for next-edit predictions
local recent_edits = {}

vim.api.nvim_create_autocmd("TextChanged", {
    callback = function()
        local change = {
            file = vim.fn.expand("%:p"),
            time = os.time(),
            -- Store diff information
        }
        table.insert(recent_edits, change)
        -- Keep only recent N edits
        if #recent_edits > 10 then
            table.remove(recent_edits, 1)
        end
    end
})
```

#### 3. Debouncing Strategy

```lua
local debounce_timer = nil
local DEBOUNCE_MS = 100

local function trigger_completion()
    if debounce_timer then
        debounce_timer:stop()
    end

    debounce_timer = vim.defer_fn(function()
        request_completion()
    end, DEBOUNCE_MS)
end
```

#### 4. Simple Diff Format

Use original/updated blocks instead of unified diffs:

```
<|original|>
function greet(name) {
    return `Hello, ${name}`;
}
<|updated|>
function greet(name, formal = false) {
    if (formal) return `Good day, ${name}`;
    return `Hello, ${name}`;
}
```

### Key Differences for Neovim

| JetBrains (Sweep) | Neovim Equivalent |
|-------------------|-------------------|
| PSI | LSP + Tree-sitter |
| Built-in caching | Manual caching layer |
| Editor events | Autocmds |
| Inline UI | Virtual text / extmarks |

### Recommended Model Options

1. **Cloud inference**: Use their model on your own infrastructure
2. **Local inference**: `sweep-next-edit-1.5B` GGUF (1.54 GB)
   - 200 tokens/sec on Mac Mini M2
   - Sub-500ms with speculative decoding
3. **Alternative models**: Qwen2.5-Coder, DeepSeek-Coder (for comparison)

### Architecture Recommendation

```
┌─────────────────────────────────────────────────────────┐
│                    Neovim Plugin                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Context    │  │   Edit       │  │  Completion  │   │
│  │   Builder    │  │   Tracker    │  │  UI          │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │           │
│         └────────┬────────┴────────┬────────┘           │
│                  │                 │                    │
│          ┌───────▼───────┐ ┌───────▼───────┐           │
│          │  LSP Client   │ │  Tree-sitter  │           │
│          └───────────────┘ └───────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Inference Backend (choose one)              │
├─────────────────────────────────────────────────────────┤
│  • Local: llama.cpp + sweep-next-edit-1.5B (GGUF)       │
│  • Local: Ollama                                         │
│  • Cloud: Custom server with TensorRT-LLM               │
│  • Cloud: Any OpenAI-compatible API                      │
└─────────────────────────────────────────────────────────┘
```

---

## Resources

### Official Links

- [Sweep Website](https://sweep.dev/)
- [Sweep Documentation](https://docs.sweep.dev/)
- [JetBrains Plugin](https://plugins.jetbrains.com/plugin/26860-sweep-ai)
- [GitHub Organization](https://github.com/sweepai)

### Model

- [sweep-next-edit-1.5B on Hugging Face](https://huggingface.co/sweepai/sweep-next-edit-1.5B)
- Format: GGUF Q8_0 (1.54 GB)
- Performance: 200 tok/s on M2, sub-500ms completions

### Technical Blog Posts

- [Autocomplete Context Building](https://blog.sweep.dev/posts/autocomplete-context)
- [Next-Edit for JetBrains](https://blog.sweep.dev/posts/next-edit-jetbrains)
- [JetBrains Coding Agent](https://blog.sweep.dev/posts/jetbrains-coding-agent)

### JetBrains PSI Documentation

- [PSI Overview](https://plugins.jetbrains.com/docs/intellij/psi.html)
- [PSI References](https://plugins.jetbrains.com/docs/intellij/psi-references.html)
- [Navigating PSI](https://plugins.jetbrains.com/docs/intellij/navigating-psi.html)

---

## Appendix: Benchmark Comparison

From Sweep's benchmarks, their 1.5B model vs competitors:

| Model | Size | Next-Edit Score |
|-------|------|-----------------|
| **Sweep Next-Edit** | 1.5B | Best |
| Qwen2.5-Coder | 7B | -12% |
| Mercury (Inception) | ? | Lower |
| Zeta (Zed) | ? | Lower |
| Instinct (Continue) | ? | Lower |

Benchmark categories:
1. Next-edit above cursor
2. Next-edit below cursor
3. Tab-to-jump (distant changes)
4. Standard FIM
5. Noisiness (false positive rate)

---

*Analysis completed: 2026-01-24*
