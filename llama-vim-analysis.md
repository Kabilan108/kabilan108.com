# llama.vim Analysis: AI Autocomplete Implementation Deep Dive

## Executive Summary

llama.vim is a lightweight, pure Vimscript plugin (~1600 lines total) that provides LLM-based text completion using a local llama.cpp server. It implements sophisticated context gathering via a "ring buffer" system, intelligent caching with speculative completions, and a clean async architecture that works on both Vim 9.1+ and Neovim.

**Key Repository**: https://github.com/ggml-org/llama.vim

---

## 1. Plugin Architecture Overview

### File Structure

```
llama.vim/
├── plugin/llama.vim          # Entry point (1 line) - calls llama#init()
├── autoload/
│   ├── llama.vim             # Core implementation (1616 lines)
│   └── llama_debug.vim       # Debug pane implementation (140 lines)
└── doc/llama.txt             # Help documentation
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           llama.vim Plugin                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │   Autocmds   │───>│  FIM Engine  │───>│  llama.cpp Server        │  │
│  │              │    │              │    │  (HTTP /infill endpoint) │  │
│  │ CursorMovedI │    │ llama#fim()  │    └──────────────────────────┘  │
│  │ BufEnter     │    │              │                                   │
│  │ BufLeave     │    │ ┌──────────┐ │    ┌──────────────────────────┐  │
│  │ TextYankPost │    │ │ Context  │ │    │  Result Cache (LRU)      │  │
│  │ BufWritePost │    │ │ Gatherer │ │    │  g:cache_data            │  │
│  └──────────────┘    │ └──────────┘ │    │  g:cache_lru_order       │  │
│                      └──────────────┘    └──────────────────────────┘  │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Ring Buffer System                             │  │
│  │  ┌────────────┐    ┌────────────┐    ┌────────────┐              │  │
│  │  │ s:ring_    │    │ s:ring_    │    │ Chunk      │              │  │
│  │  │ chunks     │───>│ queued     │<───│ Similarity │              │  │
│  │  │ (active)   │    │ (pending)  │    │ Filtering  │              │  │
│  │  └────────────┘    └────────────┘    └────────────┘              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Ghost Text Rendering                           │  │
│  │  Neovim: nvim_buf_set_extmark() / nvim_create_namespace()        │  │
│  │  Vim:    prop_add() / prop_type_add()                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Platform Detection

The plugin detects the platform at initialization:

```vim
let s:ghost_text_nvim = exists('*nvim_buf_get_mark')  " Neovim
let s:ghost_text_vim = has('textprop')                 " Vim 9.1+
```

---

## 2. Context Gathering Strategy (Critical Section)

### 2.1 Two-Level Context System

The plugin uses a sophisticated two-level context system:

1. **Local Context**: Lines immediately around the cursor (prefix + suffix)
2. **Extra Context (Ring Buffer)**: Chunks from other files, yanked text, etc.

### 2.2 Local Context Gathering

**Function**: `s:fim_ctx_local(pos_x, pos_y, prev)`

**Location**: `/tmp/llama.vim/autoload/llama.vim:542-614`

```vim
" Default configuration for local context
let n_prefix = 256   " lines before cursor
let n_suffix = 64    " lines after cursor
```

**Strategy**:
- Grabs `n_prefix` lines BEFORE the cursor position
- Grabs `n_suffix` lines AFTER the cursor position
- Splits the current line at cursor position into prefix and suffix portions
- Handles whitespace-only lines specially (starts from beginning of line)

**Code**:
```vim
let l:lines_prefix = getline(max([1, a:pos_y - g:llama_config.n_prefix]), a:pos_y - 1)
let l:lines_suffix = getline(a:pos_y + 1, min([l:max_y, a:pos_y + g:llama_config.n_suffix]))

let l:line_cur_prefix = strpart(l:line_cur, 0, a:pos_x)  " Before cursor
let l:line_cur_suffix = strpart(l:line_cur, a:pos_x)     " After cursor
```

### 2.3 Ring Buffer System (Extra Context)

**This is the most innovative part of the plugin.**

The ring buffer accumulates "chunks" of code from various sources to provide cross-file context to the LLM.

#### Data Structures

```vim
let s:ring_chunks = []   " Current set of chunks used as extra context
let s:ring_queued = []   " Chunks queued to be sent for processing
let s:ring_n_evict = 0   " Count of evicted chunks
```

#### Configuration

```vim
ring_n_chunks:    16      " Max chunks to pass as extra context (0 to disable)
ring_chunk_size:  64      " Max lines per chunk
ring_scope:       1024    " Range around cursor for gathering chunks
ring_update_ms:   1000    " How often to process queued chunks
```

#### When Chunks Are Gathered

**Location**: `/tmp/llama.vim/autoload/llama.vim:299-308`

Chunks are gathered from these events:

1. **Yanking text** (TextYankPost):
   ```vim
   autocmd TextYankPost * if v:event.operator ==# 'y' |
       call s:pick_chunk(v:event.regcontents, v:false, v:true) | endif
   ```

2. **Entering a buffer** (BufEnter):
   ```vim
   autocmd BufEnter * call timer_start(100, {->
       s:pick_chunk(getline(
           max([1, line('.') - g:llama_config.ring_chunk_size/2]),
           min([line('.') + g:llama_config.ring_chunk_size/2, line('$')])
       ), v:true, v:true)})
   ```

3. **Leaving a buffer** (BufLeave):
   ```vim
   autocmd BufLeave * call s:pick_chunk(...)
   ```

4. **Writing a file** (BufWritePost):
   ```vim
   autocmd BufWritePost * call s:pick_chunk(...)
   ```

5. **During FIM requests** (when cursor moves significantly):
   ```vim
   " Only gather chunks if the cursor has moved > 32 lines
   if a:is_auto && l:delta_y > 32
       " Expand the prefix even further
       call s:pick_chunk(getline(max([1, l:pos_y - g:llama_config.ring_scope]), ...))
       " Pick a suffix chunk
       call s:pick_chunk(getline(min([l:max_y, l:pos_y + g:llama_config.n_suffix]), ...))
   endif
   ```

#### Chunk Selection Algorithm

**Function**: `s:pick_chunk(text, no_mod, do_evict)`

**Location**: `/tmp/llama.vim/autoload/llama.vim:364-444`

```vim
function! s:pick_chunk(text, no_mod, do_evict)
    " Skip if buffer has unsaved changes or isn't a file
    if a:no_mod && (getbufvar(bufnr('%'), '&modified') || !buflisted(bufnr('%')))
        return
    endif

    " Don't pick very small chunks (< 3 lines)
    if len(a:text) < 3
        return
    endif

    " If chunk is larger than ring_chunk_size, pick a random subset
    if len(a:text) + 1 < g:llama_config.ring_chunk_size
        let l:chunk = a:text
    else
        let l:l0 = s:rand(0, max([0, len(a:text) - g:llama_config.ring_chunk_size/2]))
        let l:l1 = min([l:l0 + g:llama_config.ring_chunk_size/2, len(a:text)])
        let l:chunk = a:text[l:l0:l:l1]
    endif

    " Check for duplicates
    " ...

    " Evict similar chunks (similarity > 0.9)
    for i in range(len(s:ring_chunks) - 1, 0, -1)
        if s:chunk_sim(s:ring_chunks[i].data, l:chunk) > 0.9
            if a:do_evict
                call remove(s:ring_chunks, i)
                let s:ring_n_evict += 1
            else
                return
            endif
        endif
    endfor

    " Add to queue with metadata
    call add(s:ring_queued, {
        'data': l:chunk,
        'str': l:chunk_str,
        'time': reltime(),
        'filename': expand('%')
    })
endfunction
```

#### Chunk Similarity Algorithm

**Function**: `s:chunk_sim(c0, c1)`

**Location**: `/tmp/llama.vim/autoload/llama.vim:341-357`

A simple line-based similarity measure:

```vim
function! s:chunk_sim(c0, c1)
    let l:lines0 = len(a:c0)
    let l:lines1 = len(a:c1)
    let l:common = 0

    for l:line0 in a:c0
        for l:line1 in a:c1
            if l:line0 == l:line1
                let l:common += 1
                break
            endif
        endfor
    endfor

    return 2.0 * l:common / (l:lines0 + l:lines1)
endfunction
```

This calculates similarity as: `2 * common_lines / (total_lines_in_both)`

#### Background Ring Buffer Updates

**Function**: `s:ring_update()`

**Location**: `/tmp/llama.vim/autoload/llama.vim:462-533`

The ring buffer is processed in the background every `ring_update_ms` (default: 1000ms):

```vim
function! s:ring_update()
    call timer_start(g:llama_config.ring_update_ms, {-> s:ring_update()})

    " Only update if in normal mode or cursor hasn't moved for 3+ seconds
    if mode() !=# 'n' && reltimefloat(reltime(s:t_last_move)) < 3.0
        return
    endif

    if len(s:ring_queued) == 0
        return
    endif

    " Move first queued chunk to ring buffer
    if len(s:ring_chunks) == g:llama_config.ring_n_chunks
        call remove(s:ring_chunks, 0)  " FIFO eviction
    endif
    call add(s:ring_chunks, remove(s:ring_queued, 0))

    " IMPORTANT: Send async request to pre-cache the context
    let l:extra = s:ring_get_extra()
    let l:request = {
        \ 'id_slot':          0,
        \ 'input_prefix':     "",
        \ 'input_suffix':     "",
        \ 'input_extra':      l:extra,
        \ 'prompt':           "",
        \ 'n_predict':        0,        " Don't generate anything
        \ 'cache_prompt':     v:true,   " Just cache the context
        \ 't_max_prompt_ms':  1,
        \ 't_max_predict_ms': 1,
    \ }
    " ... send request with no callbacks
endfunction
```

**Key Insight**: When new chunks are added to the ring buffer, the plugin sends a "warm-up" request to the server with `n_predict: 0`. This pre-caches the context on the server side, making subsequent completions much faster!

---

## 3. Prompt Building / FIM Format

### 3.1 Fill-in-Middle (FIM) Request Structure

**Function**: `llama#fim(pos_x, pos_y, is_auto, prev, use_cache)`

**Location**: `/tmp/llama.vim/autoload/llama.vim:636-826`

The plugin uses llama.cpp's `/infill` endpoint with this structure:

```vim
let l:request = {
    \ 'id_slot':          0,
    \ 'input_prefix':     l:prefix,      " Lines before cursor
    \ 'input_suffix':     l:suffix,      " Lines after cursor
    \ 'input_extra':      l:extra,       " Ring buffer chunks
    \ 'prompt':           l:middle,      " Current line before cursor
    \ 'n_predict':        128,           " Max tokens to generate
    \ 'stop':             [],            " Stop strings
    \ 'n_indent':         l:indent,      " Current indentation level
    \ 'top_k':            40,
    \ 'top_p':            0.90,
    \ 'samplers':         ["top_k", "top_p", "infill"],
    \ 'stream':           v:false,       " Non-streaming
    \ 'cache_prompt':     v:true,        " Enable server-side caching
    \ 't_max_prompt_ms':  500,           " Max prompt processing time
    \ 't_max_predict_ms': 1000,          " Max generation time (or 250ms for first request)
    \ 'response_fields':  [              " Request only specific fields
    \     "content",
    \     "timings/prompt_n",
    \     "timings/prompt_ms",
    \     ...
    \   ],
    \ }
```

### 3.2 Extra Context Format

Each chunk in `input_extra` has this structure:

```vim
let l:extra = []
for l:chunk in s:ring_chunks
    call add(l:extra, {
        \ 'text':     l:chunk.str,      " Chunk content as string
        \ 'time':     l:chunk.time,     " When it was captured
        \ 'filename': l:chunk.filename  " Source file
    \ })
endfor
```

### 3.3 Context Structure Example

```
input_prefix: (256 lines before cursor, joined with \n)
prompt: (current line content before cursor - the "middle")
input_suffix: (64 lines after cursor, joined with \n)
input_extra: [
    { text: "chunk1 content\n", filename: "file1.py", time: ... },
    { text: "chunk2 content\n", filename: "file2.py", time: ... },
    ...
]
```

---

## 4. llama.cpp Server Integration

### 4.1 Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/infill` | FIM completion (default: `http://127.0.0.1:8012/infill`) |
| `/v1/chat/completions` | Instruction-based editing |

### 4.2 HTTP Communication

Uses `curl` via async job execution:

```vim
let l:curl_command = [
    \ "curl",
    \ "--silent",
    \ "--no-buffer",
    \ "--request", "POST",
    \ "--url", g:llama_config.endpoint_fim,
    \ "--header", "Content-Type: application/json",
    \ "--data", "@-",  " Read from stdin
    \ ]

" Neovim async execution
let s:current_job_fim = jobstart(l:curl_command, {
    \ 'on_stdout': function('s:fim_on_response', [l:hashes]),
    \ 'on_exit':   function('s:fim_on_exit'),
    \ 'stdout_buffered': v:true
    \ })
call chansend(s:current_job_fim, l:request_json)
call chanclose(s:current_job_fim, 'stdin')
```

### 4.3 Leveraging Server-Side Context Caching

**Critical Feature**: The plugin relies heavily on llama.cpp's `cache_prompt` feature:

```vim
'cache_prompt': v:true
```

Combined with `--cache-reuse 256` server flag, this enables:
- Server maintains context cache between requests
- Only new/changed tokens need processing
- Dramatically faster completions at large context sizes

### 4.4 Recommended Server Settings

From documentation:

```bash
llama-server \
    -m {model.gguf} \
    --port 8012 \
    -ngl 99 \               # GPU layers
    -fa \                   # Flash attention
    -dt 0.1 \               # Draft threshold
    --ubatch-size 512 \     # Micro-batch size
    --batch-size 1024 \     # Batch size
    --ctx-size 0 \          # Use model max context
    --cache-reuse 256       # Enable context reuse
```

---

## 5. Performance Optimizations

### 5.1 Request Debouncing

**Location**: `/tmp/llama.vim/autoload/llama.vim:649-657`

```vim
" Avoid sending repeated requests too fast
if s:current_job_fim != v:null
    if s:timer_fim != -1
        call timer_stop(s:timer_fim)
        let s:timer_fim = -1
    endif
    " Retry after 100ms
    let s:timer_fim = timer_start(100, {-> llama#fim(...)})
    return
endif
```

### 5.2 Cancelling In-Flight Requests

**Location**: `/tmp/llama.vim/autoload/llama.vim:780-786`

```vim
if s:current_job_fim != v:null
    if s:ghost_text_nvim
        call jobstop(s:current_job_fim)
    elseif s:ghost_text_vim
        call job_stop(s:current_job_fim)
    endif
endif
```

### 5.3 LRU Result Cache

**Location**: `/tmp/llama.vim/autoload/llama.vim:126-159`

```vim
let g:cache_data = {}        " Hash -> response mapping
let g:cache_lru_order = []   " LRU tracking

function! s:cache_insert(key, value)
    " Evict if at capacity
    if len(keys(g:cache_data)) > (g:llama_config.max_cache_keys - 1)
        let l:lru_key = g:cache_lru_order[0]
        call remove(g:cache_data, l:lru_key)
        call remove(g:cache_lru_order, 0)
    endif

    let g:cache_data[a:key] = a:value

    " Move to end of LRU list
    call filter(g:cache_lru_order, 'v:val !=# a:key')
    call add(g:cache_lru_order, a:key)
endfunction
```

**Cache Key**: SHA256 hash of `prefix + middle + 'I' + suffix`

### 5.4 Speculative FIM (Pre-fetching)

**Location**: `/tmp/llama.vim/autoload/llama.vim:946-951`

After displaying a completion, the plugin speculatively requests the NEXT completion assuming the user will accept:

```vim
" Run async speculative FIM in background for this position
if s:fim_hint_shown
    call llama#fim(l:pos_x, l:pos_y, v:true, s:fim_data['content'], v:true)
endif
```

The `prev` parameter contains the currently displayed completion, and the context is built as if that completion was already inserted!

### 5.5 Adaptive Timeout

**Location**: `/tmp/llama.vim/autoload/llama.vim:676-680`

```vim
let l:t_max_predict_ms = g:llama_config.t_max_predict_ms  " Default: 1000ms
if empty(a:prev)
    " First request is quick - we'll launch speculative after
    let l:t_max_predict_ms = 250
endif
```

### 5.6 Smart Cache Lookup with Sliding Window

**Location**: `/tmp/llama.vim/autoload/llama.vim:911-942`

The plugin looks for cached completions up to 128 characters "behind" the current position:

```vim
" Look back up to 128 characters to find a cached completion
for i in range(128)
    let l:removed = l:pm[-(1 + i):]
    let l:ctx_new = l:pm[:-(2 + i)] . 'I' . l:suffix
    let l:hash_new = sha256(l:ctx_new)
    let l:response_cached = s:cache_get(l:hash_new)

    if l:response_cached != v:null
        let l:response = json_decode(l:response_cached)
        " Check if the typed characters match the cached completion
        if l:response['content'][0:i] !=# l:removed
            continue
        endif
        " Trim the matched part from the completion
        let l:response['content'] = l:response['content'][i + 1:]
        " Use this cached result
    endif
endfor
```

This means if you have a cached completion for "func" and you type "function", it can reuse the cached result!

### 5.7 Multiple Hash Keys for Cache

**Location**: `/tmp/llama.vim/autoload/llama.vim:686-698`

```vim
" Compute multiple hashes for scrolled context
let l:hashes = []
call add(l:hashes, sha256(l:prefix . l:middle . 'I' . l:suffix))

" Also hash with trimmed prefix (for scroll tolerance)
let l:prefix_trim = l:prefix
for i in range(3)
    let l:prefix_trim = substitute(l:prefix_trim, '^[^\n]*\n', '', '')
    if empty(l:prefix_trim)
        break
    endif
    call add(l:hashes, sha256(l:prefix_trim . l:middle . 'I' . l:suffix))
endfor
```

This allows cache hits even when the user has scrolled slightly!

---

## 6. User Experience

### 6.1 Ghost Text Display

**Neovim** - Uses extmarks with virtual text:

```vim
let l:id_vt_fim = nvim_create_namespace('vt_fim')

" First line (overlay at cursor)
call nvim_buf_set_extmark(l:bufnr, l:id_vt_fim, l:pos_y - 1, l:pos_x, {
    \ 'virt_text': [[l:content[0], 'llama_hl_fim_hint'], [l:info, 'llama_hl_fim_info']],
    \ 'virt_text_pos': 'overlay'
    \ })

" Additional lines (below current line)
call nvim_buf_set_extmark(l:bufnr, l:id_vt_fim, l:pos_y - 1, 0, {
    \ 'virt_lines': map(l:content[1:], {idx, val -> [[val, 'llama_hl_fim_hint']]})
    \ })
```

**Vim 9.1+** - Uses text properties:

```vim
call prop_add(l:pos_y, l:pos_x + 1, {
    \ 'type': s:hlgroup_hint,
    \ 'text': l:new_suffix
    \ })

for line in l:content[1:]
    call prop_add(l:pos_y, 0, {
        \ 'type': s:hlgroup_hint,
        \ 'text': line,
        \ 'text_padding_left': s:get_indent(line),
        \ 'text_align': 'below'
        \ })
endfor
```

### 6.2 Default Keymaps

| Key | Action |
|-----|--------|
| `<Tab>` | Accept full suggestion |
| `<S-Tab>` | Accept first line only |
| `<C-B>` | Accept first word only |
| `<C-F>` | Trigger FIM manually |
| `<C-I>` | Trigger instruction mode |

### 6.3 Highlight Groups

```vim
highlight default llama_hl_fim_hint guifg=#ff772f ctermfg=202  " Orange
highlight default llama_hl_fim_info guifg=#77ff2f ctermfg=119  " Green
```

### 6.4 Info Display

The plugin shows performance stats inline or in statusline:

```
   | c: 15186, r: 30/64, e: 1, q: 0/16, C: 42/250 | p: 260 (12.5 ms, 20800 t/s) | g: 24 (124.5 ms, 192 t/s)
```

- `c`: Tokens cached on server
- `r`: Ring chunks (current/max)
- `e`: Evicted chunks
- `q`: Queued chunks
- `C`: Cache entries (current/max)
- `p`: Prompt tokens (count, time, speed)
- `g`: Generated tokens (count, time, speed)

---

## 7. Instruction-Based Editing

**Function**: `llama#inst(start, end)`

**Location**: `/tmp/llama.vim/autoload/llama.vim:1250-1331`

A secondary feature that allows GPT-style instruction editing:

```vim
let l:system_message = {
    \ 'role': 'system',
    \ 'content': 'You are a code-editing assistant. Return ONLY the result...'
    \ }

let l:user_content  = ""
let l:user_content .= "--- context ----------------------------------------------------\n"
let l:user_content .= join(l:extra, "\n") . "\n"
let l:user_content .= "--- selection --------------------------------------------------\n"
let l:user_content .= join(a:lines, "\n") . "\n"
let l:user_content .= "--- instruction ------------------------------------------------\n"
let l:user_content .= a:inst . "\n"
```

Uses `/v1/chat/completions` endpoint for OpenAI-compatible chat format.

---

## 8. Key Features Summary

| Feature | Implementation |
|---------|---------------|
| **FIM Completion** | Local context (256+64 lines) + ring buffer chunks |
| **Ring Buffer** | 16 chunks of 64 lines each, FIFO eviction, similarity filtering |
| **Caching** | LRU cache with 250 entries, sliding window lookup |
| **Speculative FIM** | Pre-fetches completion assuming current will be accepted |
| **Context Pre-warming** | Sends n_predict=0 requests to cache context on server |
| **Request Debouncing** | 100ms timer, cancels in-flight requests |
| **Ghost Text** | Neovim extmarks / Vim text properties |
| **Partial Accept** | Full, line, or word acceptance |
| **Instruction Editing** | Chat-based code transformation |
| **Cross-file Context** | Gathers from BufEnter/Leave, yank, file save |

---

## 9. Lessons Learned / Patterns to Adopt

### 9.1 Must-Have Patterns

1. **Ring Buffer for Cross-File Context**
   - Accumulate chunks from file navigation, yanks, saves
   - Use similarity filtering to avoid redundant context
   - FIFO eviction when at capacity

2. **Context Pre-warming**
   - Send requests with `n_predict=0` to pre-cache context
   - Do this in background when ring buffer updates

3. **Speculative Completion**
   - After showing a completion, immediately request the NEXT one
   - Build context as if current completion was accepted

4. **Smart Cache with Sliding Window**
   - Don't just cache exact contexts
   - Look back N characters to find reusable completions
   - Store multiple hashes for scroll tolerance

5. **Request Management**
   - Debounce rapid requests (100ms minimum)
   - Cancel in-flight requests when new input arrives
   - Use adaptive timeouts (fast initial, normal speculative)

### 9.2 Server-Side Optimization

The plugin relies on llama.cpp server features:
- `cache_prompt: true` for context reuse
- `--cache-reuse 256` server flag
- `id_slot: 0` for consistent slot allocation

### 9.3 UX Patterns

1. **Partial acceptance** (full/line/word) is very useful
2. **Info display** shows performance metrics for debugging
3. **Auto-trigger suppression** when suffix > 8 chars
4. **Whitespace handling** - start from line beginning on empty lines

### 9.4 What's NOT Used

The plugin does NOT use:
- TreeSitter for semantic context
- LSP for type information
- AST parsing of any kind
- File-type specific handling

It relies purely on text-based context gathering, which keeps it simple and universal.

---

## 10. Potential Improvements for New Plugin

Based on this analysis, a new plugin could enhance:

1. **Semantic Context** - Use TreeSitter to identify function boundaries, class definitions
2. **LSP Integration** - Include type hints, function signatures in context
3. **Smarter Chunk Selection** - Weight chunks by recency, relevance, file type
4. **Project-Aware Context** - Understand import relationships, prefer related files
5. **Streaming Responses** - Show partial completions as they arrive
6. **Better Similarity** - Use token-based or embedding similarity instead of line matching
7. **Persistent Context** - Save ring buffer across sessions
8. **Multi-Model Support** - Different models for different file types

---

## Appendix: Configuration Reference

```vim
let g:llama_config = {
    \ 'endpoint_fim':           'http://127.0.0.1:8012/infill',
    \ 'endpoint_inst':          'http://127.0.0.1:8012/v1/chat/completions',
    \ 'model_fim':              '',
    \ 'model_inst':             '',
    \ 'api_key':                '',
    \ 'n_prefix':               256,
    \ 'n_suffix':               64,
    \ 'n_predict':              128,
    \ 'stop_strings':           [],
    \ 't_max_prompt_ms':        500,
    \ 't_max_predict_ms':       1000,
    \ 'show_info':              2,
    \ 'auto_fim':               v:true,
    \ 'max_line_suffix':        8,
    \ 'max_cache_keys':         250,
    \ 'ring_n_chunks':          16,
    \ 'ring_chunk_size':        64,
    \ 'ring_scope':             1024,
    \ 'ring_update_ms':         1000,
    \ 'keymap_fim_trigger':     "<C-F>",
    \ 'keymap_fim_accept_full': "<Tab>",
    \ 'keymap_fim_accept_line': "<S-Tab>",
    \ 'keymap_fim_accept_word': "<C-B>",
    \ 'keymap_inst_trigger':    "<C-I>",
    \ 'keymap_inst_accept':     "<Tab>",
    \ 'keymap_inst_cancel':     "<Esc>",
    \ 'keymap_debug_toggle':    v:null,
    \ 'enable_at_startup':      v:true,
\ }
```
