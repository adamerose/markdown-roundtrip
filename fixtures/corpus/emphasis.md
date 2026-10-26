**Bold text** and *italic text* and ~~strikethrough text~~ and `inline code`.

## Star Bold and Italic

**star bold**

*star italic*

***star bold italic***

## Underscore Bold and Italic

__underscore bold__

_underscore italic_

___underscore bold italic___

## Mixed Bold-Italic Combinations

_**one underscore two asterisk bold italic**_

__*two underscore one asterisk bold italic*__

*__one asterisk two underscore bold italic__*

**_mixed two_**

## Bold and Italic Together

**bold** and *italic* on same line.

Mixed __underscore bold__ and **asterisk bold** on one line.

Mixed _underscore italic_ and *asterisk italic_ on one line.

## Emphasis Adjacent to Various Characters

**Bold** at start.

End with **bold**.

Middle **bold** text.

(**bold in parens**)

"**bold in quotes**"

'*italic in quotes*'

## Single Character Emphasis

**B**

*I*

~~S~~

## Emphasis at Start and End of Line

**Bold start** of paragraph.

*Italic start* of paragraph.

~~Strike start~~ of paragraph.

End of paragraph **bold end**.

End of paragraph *italic end*.

End of paragraph ~~strike end~~.

## Intraword Emphasis

foo*bar*baz

foo**bar**baz

foo_bar_baz

foo__bar__baz

## Strikethrough with Other Formatting

~~**bold strikethrough**~~

~~*italic strikethrough*~~

**~~strike inside bold~~**

*~~strike inside italic~~*

~~***bold italic strike***~~

## Nested Emphasis

**bold with *nested italic* inside**

*italic with **bold** inside*

***bold italic text***

## Adjacent Emphasis No Space

**bold***italic*

*italic***bold**

**bold1****bold2**

## Bold Then Immediately Italic

**bold text***italic text*

## Multiple Emphasis Spans Separated by Single Space

**a** **b** **c** **d** **e**

*a* *b* *c* *d* *e*

## Long Chain of Alternating Formats

**bold** *italic* **bold** *italic* **bold** *italic*

## Emphasis Near Code Spans

**bold**`code`

*italic*`code`

`code`**bold**

`code`*italic*

**bold**`code`**bold**

`code`**bold**`code`

## Bold Wrapping Code Span

**bold `code` bold**

*italic `code` italic*

## Emphasis with Punctuation Boundaries

It's a *test* of emphasis. Can you **handle** it?

Parens around (*italic*) and (**bold**) and (`code`) text.

*word,* another

**word.** next

## Underscore in Words (Not Emphasis)

This has_underscores_in_it which should NOT be italic.

But *this* should be italic.

file_name_with_underscores.txt should have no emphasis.

## Unpaired Delimiters (No False Positives)

Use 2**3 for exponentiation.

This has *italic stars* and *italic underscores* in the same line.

Compute 2_*3 then emphasize *this word_ carefully.

## Emphasis Wrapping Links

**[bold link text](https://example.com)**

*[italic link text](https://example.com)*

***[bold italic link](https://example.com)***

## Link Then Emphasis / Emphasis Then Link

**bold**[link](https://example.com)

*italic*[link](https://example.com)

[link](https://example.com)**bold**

[link](https://example.com)*italic*

## Bold Wrapping Link and Text (Format Run)

**text [link](https://example.com) text**

*text [link](https://example.com) text*

**[first](https://example.com) and [second](https://b.com)**

## Multiple Bold-Wrapped Links

**[a](https://a.com)** and **[b](https://b.com)** and **[c](https://c.com)**

## Emphasis in Heading

## **All Bold Heading**

## *All Italic Heading*

## ~~All Strikethrough Heading~~

## Emphasis in Blockquote

> **Bold on first line** and *italic*.
>
> **Underscore bold** and *underscore italic*.

## Emphasis in Table Cells

| **Bold** | *Italic* | `Code` |
| --- | --- | --- |
| **cell** | *cell* | `cell` |
| **cell** | *cell* | ***cell*** |

## Emphasis in List Items

- **bold** item
- *italic* item
- `code` item
- ~~strikethrough~~ item

## Emphasis Inside Setext Heading

**Bold** and *italic* heading
=============================

## **Bold** heading ##

## Strikethrough Around Link

~~[link](https://example.com)~~

## Bold Link and Italic Link Together

**[bold](https://a.com)** and *[italic](https://b.com)*

## Multiple Italic Spans

*[link](https://example.com)* is here.

*word one* and *word two* and *word three*

## Deeply Nested Strikethrough

~~***bold italic strike***~~

## Emphasis Directly Adjacent to Punctuation

**bold,** rest of sentence.

*italic;* rest of sentence.

(**parenthesized bold**)

[*italic in link text*](https://example.com)

## Multiple Format Runs on One Line

**first bold** normal **second bold** normal **third bold**

*first italic* normal *second italic* normal *third italic*

## Bold Italic Then Code

***bold italic*** `code` ***more bold italic***

## Emphasis Around Special Characters

**hello & world**

*less < greater > signs*

**"quoted bold"**

## Sequential Different Emphasis Types

**bold** *italic* ~~strike~~ `code` **bold** *italic*

## Underscore Emphasis Nested in Star

***nested bold italic combo***

## Emphasis Wrapping Entire Paragraph Content

**This entire paragraph is bold from start to end.**

*This entire paragraph is italic from start to end.*

~~This entire paragraph is struck from start to end.~~

## Adjacent Bold and Italic No Space Between

**bold***italic*more text

*italic***bold**more text

## Emphasis with Numbers

**123** and *456* and `789`

**v2.0** release *notes*

## Emphasis at Word Boundaries with Punctuation

**word**. End sentence.

*word*, continuation.

**word**: definition.

*word*; semicolon after.

## Bold Immediately Before Parenthesis

(**bold**)

(*italic*)

## Multiple Emphasis Types in One Paragraph

This has **bold**, *italic*, ~~strike~~, and `code` all together in a single paragraph with normal text between each one.

## Emphasis Adjacent to Numbers

**2** items

*3* things

Version **4.0** released.

## Empty-Looking Emphasis

**** (four stars)

** ** (double star space double star)

## Bold Wrapping Multiple Words

**multiple bold words in sequence**

*multiple italic words in sequence*

## Emphasis Ending with Punctuation

**bold!**

*italic?*

**bold...**

*italic—*

## Full-Line Bold Then Regular

**This is all bold.**

This is regular.

## Emphasis in Different Paragraph Positions

Starting with **bold** text.

Text with *italic* in the middle.

Text ending with `code`.

## Emphasis Spanning Entire Heading Content

## **All Bold Heading Content Here**

## *All Italic Heading Content Here*

## Multiple Emphasis in Heading

### **Bold** and *italic* and `code` heading

## Star Bold Then Underscore Italic Same Line

**bold** and _italic_

## Underscore Bold Then Star Italic Same Line

__bold__ and *italic*

## Mixed Delimiters Multiple Spans

__bold1__ **bold2** __bold3__

_italic1_ *italic2* _italic3_

## Strikethrough Wrapping Autolink

~~<https://example.com>~~

## Strikethrough in List Item

- ~~struck item~~ remaining text
- Normal item

## Strikethrough in Table Cell

| Feature | Status |
| --- | --- |
| Old feature | ~~deprecated~~ |
| New feature | **active** |

## Bold Immediately After Autolink

<https://example.com>**bold after autolink**

## Italic Immediately After Autolink

<https://example.com>*italic after autolink*

## Multiple Strikethrough Spans

~~first~~ normal ~~second~~ normal ~~third~~

## Strikethrough with Punctuation

~~word.~~ Rest of sentence.

~~word,~~ continuation.

(~~parenthesized strike~~)

## Autolink in Bold Then Underscore Bold After

**<https://example.com>** then __underscore bold__ and **star bold** here.

## Autolink in Italic Then Underscore Italic After

*<https://example.com>* then _underscore italic_ and *star italic* here.

## Emphasis Around Punctuation Boundary

*word.* Next sentence.

**word!** Next sentence.

*"quoted italic"*

**"quoted bold"**

## Emphasis with Unicode Content

*café* and **résumé** and ~~naïve~~

**日本語の太字** and *イタリック*

## Emphasis Adjacent to Escaped Characters

\**not bold but next is* italic*

**bold** \*literal stars\* **bold**

*italic* \*not italic\* *italic again*

## Emphasis with Only Special Characters Inside

**&** bold ampersand

*<* italic less-than

**>** bold greater-than

## Triple Emphasis Mixed Delimiters

___triple underscore emphasis___

**_star-bold underscore-italic_**

*__star-italic underscore-bold__*

_**underscore-italic star-bold**_

__*underscore-bold star-italic*__

## Consecutive Same-Type Emphasis Spans

*a* *b* *c* *d*

**a** **b** **c** **d**

_a_ _b_ _c_ _d_

__a__ __b__ __c__ __d__

## Strikethrough Wrapping Bold-Italic

~~***bold italic strikethrough***~~
