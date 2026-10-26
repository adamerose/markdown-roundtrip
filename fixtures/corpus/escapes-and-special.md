## Basic Backslash Escapes

\*Not italic\*

\*\*Not bold\*\*

\# Not a heading

\- Not a list item

\> Not a blockquote

\` Not code

\[ Not a link

\] bracket

\( paren

\) paren

\! not image start

1\. Not an ordered list

## Literal Backslash

A literal backslash: \\

Two literal backslashes: \\\\

Backslash before text: \\hello

## Escapes in Emphasis

*text with \* escaped star*

**bold with \*\* escaped**

_text with \_ escaped underscore_

## Escapes in Links

[link with \] bracket](http://example.com)

[normal](http://example.com/path\(1\))

## Escapes in Code (Literal)

`\*not escaped in code\*`

```
\* also not escaped in fenced code
```

## Escaped Pipe in Table

| Col A | Col B |
| ----- | ----- |
| a \| b | c |
| d | e \| f |

## Consecutive Escapes

\*\*not bold\*\*

\#\# not heading

\-\-\- not a rule

## Escapes in Headings

### Heading with \*escaped asterisks\* and \[brackets\]

### Heading with \`backticks\`

## Escapes in List Items

- Item with \*escaped asterisks\*
- Item with \[escaped brackets\]
- Item with \\backslash\\

1. Ordered item with \*escaped star\*
2. Ordered item with \[escaped bracket\]

## Escapes in Blockquotes

> Paragraph with \*escaped asterisks\* and \\backslash\\.

> Quote with \`escaped backtick\`

## Escapes in Bold/Italic Context

**Bold with \*escaped\* star inside**

*Italic with \_escaped\_ underscore inside*

## Escapes at Line Start

\- not a list item

\* also not a list item

\+ also not a list item

\> not a blockquote

\# not a heading

## Multiple Escapes in One Line

\*\*not bold\*\* and \*not italic\* and \`not code\`

## Escaped Characters After Formatting

\*not italic\* but *this is italic*.

\*\*not bold\*\* but **this is bold**.

## Escaped Characters in Various Positions

Text with \*asterisks\* that are not emphasis.

Text with \_underscores\_ that are not emphasis.

Text with \[brackets\] that are not a link.

Text with \`backticks\` that are not code.

## Backslash Before Various Characters

\! \@ \# \$ \% \^ \& \( \) \- \_ \+ \= \[ \] \{ \} \| \\ \; \: \' \" \, \. \< \> \/ \? \`

## Hard Line Breaks (Two Trailing Spaces)

Line one with two trailing spaces.  
Line two after hard break.

## Multiple Hard Breaks

First.  
Second.  
Third.  
Fourth.

## Hard Break in Emphasis

*First line.  
Second line.*

**Bold first.  
Bold second.**

## Hard Break in Blockquote

> First line.  
> Second line after break.

## Backslash Line Break

First line\
second line via backslash break

## HTML Entities (Named)

&amp; &lt; &gt; &quot; &apos;

&copy; &reg; &trade;

&mdash; &ndash; &hellip;

## HTML Entities (Numeric)

&#65; &#66; &#67;

&#x41; &#x42; &#x43;

&#42; &#x2a;

## Entities in Context

This &amp; that, &lt;tag&gt; value

Price: &euro;100 &mdash; discounted

## Entities Mixed with Markdown

**&amp; bold entity**

*&lt;italic entity&gt;*

`&amp;` in code span (literal)

## HTML Inline Tags

This has <em>inline emphasis</em> in it.

This has <strong>bold</strong> and <em>italic</em> together.

An <abbr title="abbreviation">abbr</abbr> tag.

<strong><em>bold italic</em></strong>

## Self-Closing Tags

Text with <br/> break.

Text with <br /> break with space.

## HTML Attributes in Inline

<span style="color:red">red text</span>

<a href="http://example.com">link</a>

## HTML Mixed with Markdown

**bold** and <em>html italic</em> together.

*markdown italic* and <strong>html bold</strong> together.

Text <sub>subscript</sub> and <sup>superscript</sup>.

## HTML Block Types

<pre>
preformatted text
</pre>

<div>
Content in div.
</div>

<p>Paragraph tag.</p>

## HTML Comments

<!-- A comment -->

Text before <!-- inline comment --> and after.

## HTML Entities as Text

Regular text & unescaped ampersand.

## Unicode Content

Café, naïve, résumé, "smart quotes", 'apostrophes', em—dash, en–dash, ellipsis…

Symbols: © ® ™ § ¶ † ‡ • ° ± ÷ × ≠ ≈ ≤ ≥ ∞ ∑ ∏ √ ∂ ∫

Arrows: → ← ↑ ↓ ↔ ⇒ ⇐ ⇑ ⇓

Currency: $ € £ ¥ ₹ ₿

Math-like: α β γ δ ε π Ω Σ Δ

## Unicode in Headings

## Heading with diacritics: test

## CJK Content

日本語テスト — Japanese test.

## Very Long Single Line

This is a deliberately very long single line paragraph that stretches far beyond the typical editor width to test how the round-trip handling works with content that would normally wrap in a display but should remain as a single line in the markdown source.

## Long Unbroken Text

Thisisaverylongwordthathasnospacesandshouldtesttheditor'sabilitytohandleoverfloworcontinuousunbrokentext.

## Backslash Before Non-Escapable Character

\z \q \w \m

## Escaped Backtick in Text

This has \`escaped backtick\` here.

## HTML Block Then Paragraph

<div class="wrapper">
content
</div>

Paragraph after HTML block.

## Self-Closing HTML Block

<hr />

## HTML Processing Instruction

<?php echo "hello"; ?>

## Hard Break Then Emphasis

Line one.  
**Bold line two.**

## Backslash Break Then Emphasis

First line\
*Italic second line.*

## Multiple Hard Breaks in List

- Item one  
  continuation after break
- Item two

## Entity in Heading

## Price: &euro;100

## HTML Inline Then Bold

Text with <span>inline html</span> and **bold**.

## Consecutive Entities

&amp;&lt;&gt;&quot;&apos;

## Escaped Hash in Paragraph

\## This is not a heading.

## Escaped Star at Line Start

\*Not a list item

\*\*Not bold\*\*

## Backslash Break in List

- Line one\
  line two after backslash

## Hard Break in List Item

- Line one  
  line two after hard break

## Escaped Pipe Outside Table

Not a \| table \| at all.

## Entity in Link Text

[R&amp;D](https://example.com)

## Multiple Entities in Sequence Inline

&amp;&lt;&gt; in **bold** context.

## HTML Comment on Its Own Line

<!-- standalone comment -->

## HTML Comment with Content Before and After

Text before <!-- comment --> text after.

## Multi-Line HTML Comment

<!--
multi-line
comment
-->

## HTML Comment Inside List

- Item one <!-- with comment -->
- Item two

## HTML Comment Inside Blockquote

> Text <!-- comment in quote --> more text.

## Escaped Characters in Heading

### \*escaped\* and \[bracketed\] heading

## Escaped Hash at Various Depths

\# Not H1

\## Not H2

\### Not H3

## Backslash Before Tilde

\~\~not strikethrough\~\~

## Escaped Pipe in Text

This has \| a pipe \| in it.

## Hard Line Break via Backslash at End

First line\
Second line after backslash break.

Third line\
Fourth line.

## Soft Line Break (Two Trailing Spaces)

Soft break first line.  
Soft break second line.  
Soft break third line.

## Multiple Hard Breaks Mixed Styles

Line A.  
Line B.\
Line C.  
Line D.

## Hard Break in Bold Context

**Bold first line.  
Bold second line.**

## Hard Break in Italic Context

*Italic first line.  
Italic second line.*

## Backslash Break in Bold

**Bold line one\
Bold line two**

## Backslash Break in Italic

*Italic line one\
Italic line two*
