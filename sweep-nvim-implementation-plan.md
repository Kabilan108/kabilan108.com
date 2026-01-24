# Sweep AI Neovim Autocomplete Plugin - Implementation Plan

## Overview

A neovim plugin in Lua that provides AI-powered autocomplete using the Sweep AI `sweep-next-edit-1.5B` model (1.5B parameters) via llama.cpp server. The plugin will combine the best approaches from both the JetBrains Sweep plugin and llama.vim.

### Key Design Principles

| Source | Pattern to Adopt |
|--------|------------------|
| **Sweep** | LSP-based semantic context, recent edit tracking, next-edit predictions, simple diff format |
| **llama.vim** | Ring buffer for cross-file context, speculative FIM, context pre-warming, smart caching |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          sweep.nvim Plugin                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  Context Engine  │  │  Completion      │  │  UI Renderer             │   │
│  │                  │  │  Manager         │  │  (Ghost Text)            │   │
│  │  - Ring Buffer   │  │                  │  │                          │   │
│  │  - LSP Context   │  │  - Cache (LRU)   │  │  - extmarks              │   │
│  │  - Edit Tracker  │  │  - Debouncing    │  │  - virtual text          │   │
│  │  - TreeSitter    │  │  - Speculative   │  │  - partial accept        │   │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────────────────┘   │
│           │                     │                                            │
│           └──────────┬──────────┘                                            │
│                      │                                                       │
│           ┌──────────▼──────────┐                                            │
│           │  Request Handler    │                                            │
│           │  - Async HTTP       │                                            │
│           │  - Request cancel   │                                            │
│           │  - Pre-warming      │                                            │
│           └──────────┬──────────┘                                            │
│                      │                                                       │
└──────────────────────┼───────────────────────────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │  llama.cpp Server     │
           │  /infill endpoint     │
           │  sweep-next-edit-1.5B │
           └───────────────────────┘
```

---

## Phase 0: Project Setup & Infrastructure

**Goal**: Establish project structure, build system, and development environment.

### Tasks

| ID | Task | Parallelizable |
|----|------|----------------|
| 0.1 | Create plugin directory structure (`lua/sweep/`, `plugin/`, `doc/`) | No |
| 0.2 | Set up basic plugin entry point with lazy loading | After 0.1 |
| 0.3 | Create configuration module with sensible defaults | After 0.1 |
| 0.4 | Set up testing framework (plenary.nvim tests) | Yes (with 0.2) |
| 0.5 | Create Makefile/scripts for common dev tasks | Yes (with 0.2) |

### Directory Structure

```
sweep.nvim/
├── lua/
│   └── sweep/
│       ├── init.lua              # Main entry, setup()
│       ├── config.lua            # Configuration management
│       ├── context/
│       │   ├── init.lua          # Context engine coordinator
│       │   ├── local.lua         # Local context (prefix/suffix)
│       │   ├── ring_buffer.lua   # Ring buffer implementation
│       │   ├── lsp.lua           # LSP-based context
│       │   ├── treesitter.lua    # TreeSitter utilities
│       │   └── edit_tracker.lua  # Recent edit tracking
│       ├── completion/
│       │   ├── init.lua          # Completion manager
│       │   ├── cache.lua         # LRU cache implementation
│       │   └── handler.lua       # Response processing
│       ├── request/
│       │   ├── init.lua          # Request coordinator
│       │   ├── http.lua          # Async HTTP client (curl/plenary)
│       │   └── queue.lua         # Request queue & debouncing
│       ├── ui/
│       │   ├── init.lua          # UI coordinator
│       │   ├── ghost_text.lua    # Ghost text rendering
│       │   └── statusline.lua    # Status/info display
│       └── util/
│           ├── init.lua          # Common utilities
│           ├── hash.lua          # Hashing functions
│           └── async.lua         # Async helpers
├── plugin/
│   └── sweep.lua                 # Plugin registration
├── doc/
│   └── sweep.txt                 # Help documentation
└── tests/
    └── sweep/                    # Test files
```

### Deliverables
- Working plugin skeleton that loads in neovim
- Configuration system with validation
- Development environment ready

---

## Phase 1: Core Infrastructure

**Goal**: Build foundational components needed by all other modules.

### Tasks (Can be parallelized across 3 agents)

#### Agent 1: HTTP & Request Infrastructure
| ID | Task |
|----|------|
| 1.1a | Implement async HTTP client using `vim.loop` (libuv) or plenary.curl |
| 1.1b | Implement request cancellation mechanism |
| 1.1c | Create request queue with debouncing (100ms default) |
| 1.1d | Implement request timeout handling |

#### Agent 2: Caching Infrastructure
| ID | Task |
|----|------|
| 1.2a | Implement LRU cache with configurable size (250 entries default) |
| 1.2b | Implement SHA256 hashing for cache keys |
| 1.2c | Implement sliding window cache lookup (128 char lookback) |
| 1.2d | Implement multiple hash keys for scroll tolerance |

#### Agent 3: Utility Infrastructure
| ID | Task |
|----|------|
| 1.3a | Create async wrapper utilities for vim.schedule |
| 1.3b | Implement timer management helpers |
| 1.3c | Create logging/debug system |
| 1.3d | Implement similarity calculation function (line-based) |

### Deliverables
- Fully functional async HTTP client
- LRU cache with smart lookup
- Utility functions ready for use

---

## Phase 2: Context Engine

**Goal**: Build the context gathering system that provides rich context to the model.

### Tasks (Can be parallelized across 2 agents)

#### Agent 1: Local Context & Ring Buffer
| ID | Task |
|----|------|
| 2.1a | Implement local context gathering (256 lines prefix, 64 lines suffix) |
| 2.1b | Implement ring buffer data structure (16 chunks, 64 lines each) |
| 2.1c | Implement chunk similarity filtering (>0.9 threshold for dedup) |
| 2.1d | Set up autocmds for chunk collection: |
|      | - `BufEnter` / `BufLeave` |
|      | - `TextYankPost` |
|      | - `BufWritePost` |
|      | - Cursor movement (>32 lines) |
| 2.1e | Implement background ring buffer processing (1000ms interval) |
| 2.1f | Implement context pre-warming (n_predict=0 requests) |

#### Agent 2: Semantic Context (LSP + TreeSitter)
| ID | Task |
|----|------|
| 2.2a | Create LSP context module: |
|      | - Get definitions at cursor via `textDocument/definition` |
|      | - Get type info via `textDocument/hover` |
|      | - Resolve symbols in visible code |
| 2.2b | Create TreeSitter context module: |
|      | - Identify current function/class boundaries |
|      | - Extract function signatures |
|      | - Get syntax-aware completion boundaries (SAFIM-style) |
| 2.2c | Implement context merging (combine local + ring + semantic) |
| 2.2d | Implement token budget management (<10k tokens target) |

### Deliverables
- Ring buffer system collecting cross-file context
- LSP integration for semantic context
- TreeSitter integration for syntax awareness
- Unified context builder producing formatted prompts

---

## Phase 3: Edit Tracking & Next-Edit Support

**Goal**: Track recent edits to enable next-edit predictions (Sweep's differentiator).

### Tasks (Sequential - depends on Phase 2)

| ID | Task | Parallelizable |
|----|------|----------------|
| 3.1 | Implement edit tracking module | No |
| 3.2 | Set up `TextChanged` / `TextChangedI` autocmds | After 3.1 |
| 3.3 | Store recent diffs in original/updated format | After 3.1 |
| 3.4 | Implement diff context formatting for prompts | After 3.3 |
| 3.5 | Add configurable edit history limit (default: 10 edits) | After 3.3 |

### Edit Format (from Sweep research)

```
<|recent_diff|>
<|original|>
    def greet(self) -> str:
        return f"Hello, {self.name}"
<|updated|>
    def greet(self, formal: bool = False) -> str:
        if formal:
            return f"Good day, {self.name}"
        return f"Hello, {self.name}"
```

### Deliverables
- Edit tracker capturing recent changes
- Diff formatting for next-edit context
- Integration with context engine

---

## Phase 4: Completion Manager

**Goal**: Orchestrate the completion flow from trigger to response.

### Tasks (Partially parallelizable)

#### Core Flow (Sequential)
| ID | Task |
|----|------|
| 4.1 | Implement completion trigger logic (on keystroke / manual) |
| 4.2 | Implement request building (combine all context sources) |
| 4.3 | Implement response parsing and validation |
| 4.4 | Implement cache integration (check before request, store after) |

#### Speculative Completion (Can parallel with 4.1-4.4)
| ID | Task |
|----|------|
| 4.5 | Implement speculative FIM (pre-fetch next completion) |
| 4.6 | Build context assuming current completion is accepted |
| 4.7 | Implement adaptive timeouts (250ms first, 1000ms speculative) |

### llama.cpp Request Format

```lua
local request = {
    id_slot = 0,
    input_prefix = prefix,      -- Lines before cursor
    input_suffix = suffix,      -- Lines after cursor
    input_extra = extra_chunks, -- Ring buffer context
    prompt = middle,            -- Current line before cursor
    n_predict = 128,            -- Max tokens
    stop = {},                  -- Stop sequences
    n_indent = indent_level,
    top_k = 40,
    top_p = 0.90,
    samplers = {"top_k", "top_p", "infill"},
    stream = false,
    cache_prompt = true,        -- Enable server-side caching
    t_max_prompt_ms = 500,
    t_max_predict_ms = 1000,
}
```

### Deliverables
- Complete completion flow working
- Speculative completion reducing perceived latency
- Smart caching reducing redundant requests

---

## Phase 5: User Interface

**Goal**: Render completions and handle user interaction.

### Tasks (Can be parallelized across 2 agents)

#### Agent 1: Ghost Text Rendering
| ID | Task |
|----|------|
| 5.1a | Create namespace for virtual text (`nvim_create_namespace`) |
| 5.1b | Implement single-line ghost text (overlay at cursor) |
| 5.1c | Implement multi-line ghost text (`virt_lines`) |
| 5.1d | Implement ghost text clearing on cursor move / mode change |
| 5.1e | Add highlight groups with sensible defaults |

#### Agent 2: Keymaps & Interaction
| ID | Task |
|----|------|
| 5.2a | Implement `<Tab>` - accept full suggestion |
| 5.2b | Implement `<S-Tab>` - accept first line only |
| 5.2c | Implement `<C-]>` - accept first word only |
| 5.2d | Implement `<C-Space>` - manual trigger |
| 5.2e | Implement `<Esc>` or typing to dismiss |
| 5.2f | Make keymaps configurable |

### Deliverables
- Ghost text rendering working
- All acceptance modes functional
- Configurable keymaps

---

## Phase 6: Statusline & Debugging

**Goal**: Provide visibility into plugin performance and state.

### Tasks (Can be fully parallelized)

| ID | Task |
|----|------|
| 6.1 | Create statusline component showing: |
|     | - Cache stats (tokens cached, hit rate) |
|     | - Ring buffer stats (chunks active/queued) |
|     | - Timing info (prompt ms, generation ms) |
| 6.2 | Create debug panel (toggle with keymap) showing: |
|     | - Current context being sent |
|     | - Ring buffer contents |
|     | - Recent requests/responses |
| 6.3 | Add verbose logging option |
| 6.4 | Create health check (`:checkhealth sweep`) |

### Deliverables
- Statusline integration
- Debug tooling for development
- Health check for troubleshooting

---

## Phase 7: Polish & Optimization

**Goal**: Optimize performance and add quality-of-life features.

### Tasks

| ID | Task | Parallelizable |
|----|------|----------------|
| 7.1 | Performance profiling and optimization | No |
| 7.2 | Add filetype-specific configurations | Yes |
| 7.3 | Add auto-trigger suppression rules (suffix > 8 chars, etc.) | Yes |
| 7.4 | Implement graceful degradation (no LSP fallback, etc.) | Yes |
| 7.5 | Add telescope integration for viewing context/history | Yes |
| 7.6 | Write comprehensive documentation | Yes |
| 7.7 | Create example configurations | Yes |

### Deliverables
- Optimized, production-ready plugin
- Full documentation
- Example configs for common setups

---

## Configuration Reference

```lua
require('sweep').setup({
    -- Server settings
    endpoint = 'http://127.0.0.1:8012/infill',
    api_key = nil,

    -- Context settings
    n_prefix = 256,           -- Lines before cursor
    n_suffix = 64,            -- Lines after cursor
    n_predict = 128,          -- Max tokens to generate

    -- Ring buffer settings
    ring_n_chunks = 16,       -- Max chunks in ring buffer
    ring_chunk_size = 64,     -- Lines per chunk
    ring_scope = 1024,        -- Range for chunk gathering
    ring_update_ms = 1000,    -- Ring buffer update interval

    -- Edit tracking
    track_edits = true,       -- Enable next-edit predictions
    max_recent_edits = 10,    -- Number of edits to track

    -- LSP/TreeSitter
    use_lsp = true,           -- Use LSP for semantic context
    use_treesitter = true,    -- Use TreeSitter for syntax

    -- Performance
    debounce_ms = 100,        -- Debounce delay
    timeout_ms = 1000,        -- Request timeout
    max_cache_entries = 250,  -- LRU cache size

    -- UI
    auto_trigger = true,      -- Trigger on keystroke
    max_line_suffix = 8,      -- Suppress if suffix > this
    ghost_text_hl = 'Comment', -- Highlight group for ghost text
    show_info = true,         -- Show timing info

    -- Keymaps
    keymap_accept = '<Tab>',
    keymap_accept_line = '<S-Tab>',
    keymap_accept_word = '<C-]>',
    keymap_trigger = '<C-Space>',
    keymap_dismiss = '<C-e>',
})
```

---

## Parallel Execution Summary

### Phase Dependencies

```
Phase 0 ──────────────────────────────────────────────────────────────────►
         │
         ▼
Phase 1 ─┬─[Agent 1: HTTP]──────────────────────────────────────────────►
         ├─[Agent 2: Cache]─────────────────────────────────────────────►
         └─[Agent 3: Utils]─────────────────────────────────────────────►
         │
         ▼ (all Phase 1 agents must complete)
Phase 2 ─┬─[Agent 1: Local + Ring Buffer]───────────────────────────────►
         └─[Agent 2: LSP + TreeSitter]──────────────────────────────────►
         │
         ▼ (all Phase 2 agents must complete)
Phase 3 ──[Edit Tracking - Sequential]──────────────────────────────────►
         │
         ▼
Phase 4 ──[Completion Manager - Partially parallel]─────────────────────►
         │
         ▼
Phase 5 ─┬─[Agent 1: Ghost Text]────────────────────────────────────────►
         └─[Agent 2: Keymaps]───────────────────────────────────────────►
         │
         ▼ (all Phase 5 agents must complete)
Phase 6 ─┬─[Statusline]─────────────────────────────────────────────────►
         ├─[Debug Panel]────────────────────────────────────────────────►
         ├─[Logging]────────────────────────────────────────────────────►
         └─[Health Check]───────────────────────────────────────────────►
         │
         ▼
Phase 7 ──[Polish - Multiple parallel tasks]────────────────────────────►
```

### Maximum Parallelism by Phase

| Phase | Max Concurrent Agents |
|-------|----------------------|
| 0 | 1-2 |
| 1 | 3 |
| 2 | 2 |
| 3 | 1 |
| 4 | 2 |
| 5 | 2 |
| 6 | 4 |
| 7 | 5+ |

---

## Questions for Clarification

1. **Model hosting**: Are you planning to run the sweep-next-edit-1.5B model locally via llama.cpp, or do you have a remote server setup in mind?

2. **Priority on features**: Should we prioritize standard FIM completion first, or do you want next-edit predictions from day one?

3. **LSP dependency**: Should the plugin work without LSP (graceful degradation), or is LSP a hard requirement?

4. **Streaming vs non-streaming**: llama.vim uses non-streaming for simplicity. Do you want streaming responses for faster perceived latency?

5. **Plugin name**: Any preference on the plugin name? (`sweep.nvim`, `sweep-complete.nvim`, etc.)

6. **Lazy.nvim vs packer vs manual**: Which plugin manager should we target for documentation/examples?

7. **Minimum neovim version**: Should we target 0.9+, 0.10+, or latest nightly?

8. **Backend flexibility**: Should we support OpenAI-compatible APIs as an alternative backend, or strictly llama.cpp?

---

## Resources

- [Sweep Model on HuggingFace](https://huggingface.co/sweepai/sweep-next-edit-1.5B)
- [llama.cpp Server Documentation](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)
- [Neovim Lua API](https://neovim.io/doc/user/lua.html)
- [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) - for completion framework integration ideas
- [llama.vim](https://github.com/ggml-org/llama.vim) - reference implementation

---

*Plan created: 2026-01-24*
