---
title: "Markdown Rendering Test"
date: "2024-03-20"
excerpt: "A comprehensive test of all Markdown rendering features"
tags: ["markdown", "testing", "documentation"]
featured: true
---

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. It also includes `inline code` and a [link to somewhere](https://example.com). This demonstrates various ways to format text in Markdown, which is a lightweight markup language designed to be easy to read and write.

![Another image](../../public/img/profile.jpeg)

Here's a paragraph with ~~strikethrough text~~ and ==highlighted text==. Markdown is widely used in documentation, README files, and content management systems. Its simplicity and flexibility make it an excellent choice for writing content that needs basic formatting without the complexity of full HTML.

![An image](https://images.kabilan108.com/profile.jpeg)

The beauty of Markdown lies in its readability even in its raw form. Writers can focus on their content while still maintaining the ability to add formatting when needed. It's particularly popular among developers and technical writers who need to create documentation that can be easily maintained and version controlled.


> This is a blockquote
> It can span multiple **lines**
> And include *formatting*
> and some `inline code`

> heres some code:
>
> ```typescript
> const x = 42;
> ```

## Lists

### Unordered Lists
- First level item
- Another item
  - Second level item
  - Another second level
    - Third level item
  - sublist
    1. subsublist
    2. another subsublist
- Back to first level

### Ordered Lists
1. First item
2. Second item
   1. Sub-item one
   2. Sub-item two
3. Third item

### Mixed Lists

Long paragraph of text that says nothing but is useful for testing list rendering.

1. First ordered item
   - Unordered sub-item
   - Another one
2. Second ordered item
   1. Ordered sub-item
   2. Another ordered sub-item

Long paragraph of text that says nothing but is useful for testing list rendering.

## Code Blocks

Inline code: `const x = 42;`

```shell
curl -LssF https://astral.sh/install | sh
```

```python
def hello_world():
    print("Hello, World! very long linke..fds afds fdsfsda fdsafsdafsdafsdafasdfsda dfsafdasfsda ")
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
key2: value2
key3:
  - subkey: subvalue
```

## Math

einstein cooked: $E = mc^2$

einstein cooked: $$E = mc^2$$

$$
\begin{align}
f(x) &= x^2 \\
g(x) &= \frac{1}{x} \\
\end{align}
$$

$$
\int_0^1 f(x) dx = \frac{1}{3}
$$
