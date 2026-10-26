## Standard Backtick Fence

```
simple code
```

## Backtick Fence with Language

```javascript
console.log("hello");
```

```python
print("hello")
```

```typescript
const x: number = 42;
```

## Tilde Fence

~~~
tilde code
~~~

## Tilde Fence with Language

~~~python
def hello():
    print("Hello!")
~~~

~~~ruby
puts "hello"
~~~

## Four Backtick Fence

````
Contains ``` inside safely.
And another ``` here.
````

## Five Backtick Fence

`````
Contains ```` inside.
And ``` too.
`````

## Four Tilde Fence

~~~~
Contains ~~~ inside safely.
~~~
Three inside — not closing.
~~~
~~~~

## Five Tilde Fence

~~~~~
Content with ~~~ inside.
And another ~~~~ here.
~~~~~

## Empty Code Block

```
```

## Code Block with Single Blank Line

```

```

## Code Block with Two Blank Lines

```


```

## Code Block with Content Then Blank

```
content

```

## Code Block with Blank Then Content

```

content
```

## Code Block with Internal Blank Lines

```
before

after
```

## Code Block with Tab Content

```
	tab indented
		double tab
	back to single
```

## Code Block Containing Markdown

```
# Not a heading
- Not a list
> Not a blockquote
| Not | A | Table |
**Not bold**
[Not a link](https://example.com)
---
```

## Code Block with Fence-Like Content

```
Not a ~~~ fence.
Not a ``` fence either.
```

## Code Block with HR-like Content

```
---
***
___
- - -
```

## Backtick Then Tilde Consecutively

```
backtick content
```

~~~
tilde content
~~~

## Multiple Code Blocks in Sequence

```
first
```

```
second
```

```
third
```

## Code Block with Pipe Characters

```
| Not | A | Table |
| --- | --- | --- |
| Just | Code | Content |
```

## Code Block with Long Language Tag

```javascript
const x = 1;
```

## Adjacent Code Blocks No Blank

```
first
```
```
second
```

## Code Block After Paragraph No Blank

Some text.
```
code block
```

## Code Block Then Paragraph No Blank

```
code block
```
Paragraph text.

## Indented Code Block (4 spaces)

    This is indented code.
    Four spaces of indent.
    No language possible.

## Indented Code Block with Blank Lines

    Line one.
    
    Line three after blank.

## Indented Code Block with Multiple Lines

    first line of indented code
    second line of indented code
    third line

## Indented Code Block Right After Heading

## Heading

    indented code right after heading

## Code Spans

Single: `code`

Double: ``code with ` backtick``

Triple: ``` code with `` double backticks ```

Quad: ```` code with ``` triple backticks ````

## Code Span Edge Cases

Double with spaces: `` `code` ``

Code span with leading/trailing space: ` code `

Code span with only spaces: `   `

Empty-looking code span: `` ` ``

## Code Spans with Special Content

`*not emphasis*`

`[not a link](url)`

`<not html>`

`# not a heading`

## Adjacent Code Spans

`a``b`

`first` and `second`

## Code Span with Backtick Inside

``code with ` inside``

`` `backtick at start``

``backtick at end` ``

## Code Span with Pipes (Table Context)

`a | b`

## Long Code Span

`int main(int argc, char *argv[]) { return 0; }`

## Backslash at End of Inline Code

`backslash at end \`

## Code Block with Trailing Blank Lines in Content

```
Line one.
Line two.

```

## Code Block with Leading Blank Line in Content

```

Leading blank above.
```

## Code Block with Tilde Content Inside Backtick Fence

```
~~~
This is not a tilde fence.
It's content inside a backtick fence.
~~~
```

## Tilde Code Block with Backtick Content

~~~
```
This is not a backtick fence.
It's content inside a tilde fence.
```
~~~

## Code Block with Trailing Whitespace Lines

```
content line
   
```

## Fence with Backticks Inside

````
Some `backticks` inside.
```
Triple backticks inside quad fence.
```
````

## Fence with Tildes Inside

~~~~
Some tildes ~~~ inside.
~~~
Triple tildes inside quad fence.
~~~
~~~~

## Code Block with Only Whitespace Content

```
   
```

## Code Block with Closing Fence Longer Than Opening

```
content here
`````

## Tilde Fence Closed by Longer Fence

~~~
tilde content
~~~~~~

## Code Fence with Trailing Space on Opening

```   
content with trailing space on opening fence
```

## Code Fence with Trailing Space on Closing

```
content with trailing space on closing fence
```   

## Indented Code Block After Blank Line

Some text.

    indented code block
    second line

More text.

## Code Span with Newline-Like Content

`foo bar`

## Code Block with Unicode Content

```
日本語コード
α = β + γ
```

## Adjacent Indented Code Blocks

    first block
    still first
    
    second block
    still second

## Code Block After Blockquote

> quote content

```
code after quote
```

## Code Block Immediately After List Item

- list item
```
code right after list
```

## Code Fence with Language and Trailing Space

```python   
code with trailing space on info string
```

## Code Block with Content That Looks Like a Heading

```
## Not a heading
### Also not a heading
# Still not a heading
```

## Indented Code After List

- Item one
- Item two

    indented code after list

## Code Block with Blank Lines at Start and End

```

content in middle


```

## Code Span Containing Backtick Sequences

`` `foo` ``

In context ``` ``foo`` ``` is a code span.

## Code Span at Start of Line

`code` at the start.

## Code Span at End of Line

At the end `code`

## Code Span Only Content in Paragraph

`entire paragraph is code`

## Multiple Code Spans in One Line

`first` normal `second` normal `third`

## Indented Code After Ordered List

1. First
2. Second

    indented after ordered list

## Indented Code After Task List

- [x] Done
- [ ] Pending

    indented after task list

## Code Fence After Tight List No Blank

- One
- Two
```
code right after tight list
```

## Code Fence After Loose List

- One

- Two

```
code after loose list
```

## Tab Indented Code After List

* Star one
* Star two

	tab indented code after list

## Indented Code with Multiple Blank Lines After List

- Item

    code line 1
    
    code line 2

## Code Fence with Tilde Then Backtick Same Content

~~~
same content
~~~

```
same content
```

## Code Span with Multiple Backtick Lengths Adjacent

`a` ``b`` ```c``` in a line.

## Code Block Between Two Paragraphs Tight

Before code.
```
code content
```
After code.

## Code Span with Backticks Adjacent to Bold

**bold** `` `foo` `` **more bold**

## Double Backtick Code Span Adjacent to Emphasis

``code with `backtick` inside`` **bold after**

## Code Span Containing Backticks Pattern

In text ``` ``foo`` ``` and **bold** together.

## Code Fence with Autolink-Like Content

```
<https://not-an-autolink.com>
<http://also-not-autolink.org>
```

## Code Span with Angle Brackets

`<https://in-code-span.com>` is just text.

## Code Block with HTML Comment Inside

```
<!-- not a real comment -->
more content
```

## Code Fence with Trailing Spaces on Info String

```python   
trailing_spaces_on_info = True
```

## Code Fence with Info String Containing Dot

```Makefile.example
target: dependency
	recipe
```

## Code Fence with Info String Containing Hyphen

```x-custom-lang
custom content
```

## Indented Code Block After Two Blank Lines

Some text.


    indented after two blanks

More text.
