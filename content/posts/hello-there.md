---
title: "Markdown Rendering Test"
date: "2024-03-20"
excerpt: "A comprehensive test of all Markdown rendering features"
tags: ["markdown", "testing", "documentation"]
featured: true
---

## Heading Level 2

### Heading Level 3

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. It also includes `inline code` and a [link to somewhere](https://example.com).

Here's a paragraph with ~~strikethrough text~~ and ==highlighted text==.

> This is a blockquote
> It can span multiple lines
> And include *formatting*

## Lists

### Unordered Lists
- First level item
- Another item
  - Second level item
  - Another second level
    - Third level item
- Back to first level

### Ordered Lists
1. First item
2. Second item
   1. Sub-item one
   2. Sub-item two
3. Third item

### Mixed Lists
1. First ordered item
   - Unordered sub-item
   - Another one
2. Second ordered item
   1. Ordered sub-item
   2. Another ordered sub-item

## Code Blocks

Inline code: `const x = 42;`

```shell
curl -LssF https://astral.sh/install | sh
```

```python
def hello_world():
    print("Hello, World!")
```

```typescript
const x = 42;
```

```javascript
const x = 42;
```

```json
{
  "key": "value"
}
```

```yaml
key: value
```

## Math

$E = mc^2$

$$E = mc^2$$


\begin{align}
    f(x) &= x^2 \\
    g(x) &= \frac{1}{x} \\
    \int_0^1 f(x) dx &= \frac{1}{3}
\end{align}
