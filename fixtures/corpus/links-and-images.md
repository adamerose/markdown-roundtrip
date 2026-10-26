## Inline Links

[Example link](https://example.com)

[Link with title](https://example.com "A title with spaces")

[Link with single quote title](https://example.com 'Single Quote Title')

[Link with parens title](http://example.com (Title in parens))

## Links with Special URL Characters

[query string](https://example.com/path?a=1&b=2#fragment)

[parentheses in URL](https://en.wikipedia.org/wiki/Markdown_(language))

[encoded spaces](http://example.com/path%20with%20spaces)

[escaped paren](http://example.com/path\(escaped\))

## Links with Formatting Inside

[**Bold link text**](https://example.com)

[*Italic link text*](https://example.com)

[`Code link text`](https://example.com)

[Link with **bold** and *italic* text](https://example.com)

[~~strikethrough link~~](http://example.com)

## Emphasis Wrapping Links

**[Bold Link](https://example.com)**

*[Italic Link](https://example.com)*

***[bold italic link](http://example.com)***

## Adjacent Links

[Link1](https://example.com)[Link2](https://example.org)

[Link1](https://example.com) [Link2](https://example.org)

## Multiple Links in One Line

See [foo](http://foo.com) and [bar](http://bar.com) and [baz](http://baz.com) for details.

## Links in Various Positions

[Start link](https://example.com) followed by text.

Text followed by [end link](https://example.com).

Text [middle link](https://example.com) more text.

## Link with Empty Text

[](https://example.com)

## Heading with Only a Link

## [Link Heading](https://example.com)

## Autolinks (Angle Bracket)

<https://example.com>

<http://example.org/path/to/page>

<https://example.com/search?q=test&lang=en>

Text with <https://example.org/other> in it.

## Bare URLs

https://example.com

http://example.org/path

https://example.com/path?query=value&other=123#fragment

## Bare URL in Context

Visit https://example.com for more.

Check https://example.org/page.

See https://example.com/docs!

Multiple: https://example.com and https://example.org and https://example.net for info.

## URL in Parentheses

(https://example.com)

## Email Autolinks

someone@example.com

Contact support@example.com for help.

## Reference Links

[full reference][ref1]

[another link][ref2]

[collapsed][]

[shortcut]

## Multiple References to Same Target

[first link][shared]

[second link][shared]

## Reference Links with Formatting

**[bold reference][ref1]**

*[italic reference][ref1]*

## Reference Link in Various Block Contexts

## Section with [ref][ref1]

- [item link][ref1]
- [another][ref2]

> See [quoted ref][ref1] here.

## Reference Link Definitions

[ref1]: https://example.com "Title One"
[ref2]: https://example.org
[shared]: https://example.com/shared "Shared Target"
[collapsed]: http://example.com/collapsed
[shortcut]: http://example.net

## Reference with Angle Brackets

[angle ref]: <https://example.com/path> "Title"

Use the [angle ref] here.

## Reference with Single Quotes

[single ref]: https://example.com 'Single Title'

Use the [single ref] here.

## Link Definitions at Various Positions

Some paragraph text.

[mid-paragraph-def]: http://example.com "After paragraph"

More text after a link definition.

## Reference Links at Document End

Text with [a][end-a], [b][end-b], and [c][end-c].

[end-a]: https://example.com/a "Title A"
[end-b]: https://example.com/b "Title B"
[end-c]: https://example.com/c

## Images

![Alt text for image](https://picsum.photos/200/100)

![alt](image.png "title text")

![](empty-alt.png)

![alt with special chars: & < >](image.png)

## Image Alt with Formatting

![alt with **bold** text](image.png)

![alt with *italic* text](image.png)

![alt with `code` text](image.png)

## Image with Special Characters in Alt

![A "quoted" image](image.png)

## Consecutive Images

![first](a.png) ![second](b.png) ![c](3.png)

## Image in Context

Text before ![inline image](img.png) and after.

## Image as Link

[![image alt](img.png)](http://example.com)

[![Alt text](image.png)](https://example.com)

## Badge-Style Image Link

[![Build Status](https://img.shields.io/badge/build-passing-green)](https://example.com/ci)

![License](https://img.shields.io/badge/license-MIT-blue)

## Link with Angle Bracket URL

[angle link](<https://example.com/path with spaces>)

## Multiple Reference Definitions Together

[ref-a]: https://example.com/a "Title A"
[ref-b]: https://example.com/b "Title B"
[ref-c]: https://example.com/c "Title C"

Use them: [link a][ref-a] and [link b][ref-b] and [link c][ref-c].

## Image with Long Alt Text

![This is a very long alt text that describes the image in great detail for accessibility purposes](image.png)

## Link Title with Special Characters

[link](https://example.com "Title with \"escaped quotes\"")

## Autolink Adjacent to Text

Before<https://example.com>after

## Multiple Autolinks in One Paragraph

See <https://first.com> and <https://second.com> and <https://third.com>.

## Reference Link Collapsed Form

[collapsed link][]

[collapsed link]: https://example.com "Collapsed"

## Image Reference

![alt text][img-ref]

[img-ref]: https://example.com/image.png "Image Title"

## Link in List Item

- [link one](https://example.com)
- [link two](https://example.org)
- Plain item

## Link in Heading

### See [documentation](https://docs.example.com) for details

## Bare URL at End of Line

Visit https://example.com

## Multiple Bare URLs Same Line

Go to https://first.com or https://second.com or https://third.com today.

## Email at End of Line

Contact support@example.com

## Link with Code Inside

[`code in link`](https://example.com)

## Link with Emphasis Inside the Text

[*italic* and **bold**](https://example.com)

## Adjacent Links No Space

[first](https://a.com)[second](https://b.com)[third](https://c.com)

## Image Then Link

![img](photo.png) [caption](https://example.com)

## Reference Link Definition After Content

Some paragraph that references [a link][def1].

[def1]: https://example.com "Reference definition"

## Multiple Reference Definitions Consecutive

[alpha]: https://alpha.com "Alpha"
[beta]: https://beta.com "Beta"
[gamma]: https://gamma.com

Use [alpha], [beta], and [gamma] links.

## Link with Very Long URL

[long url](https://example.com/very/long/path/that/goes/on/and/on/to/test/how/the/system/handles/extremely/long/urls/without/breaking)

## Autolink in Blockquote

> See <https://example.com> for details.

## Autolink in List

- <https://first.com>
- <https://second.com>
- <https://third.com>

## Image with Title

![Alt text](image.png "Image title")

## Link After Bold

**Important:** [see here](https://example.com)

## Link in Blockquote

> Visit [the site](https://example.com) for more.

## Multiple Images in Line

![a](1.png) text ![b](2.png) text ![c](3.png)

## Reference Definition with Parenthesized Title

[paren-ref]: https://example.com (Paren Title)

See [paren-ref] for details.

## Bare URL in List

- Visit https://example.com today
- Check https://other.org later

## Email in Blockquote

> Contact admin@example.com for help.

## Reference Link Definitions with Indentation

 [indented-1]: https://example.com "One space indent"

  [indented-2]: https://example.com "Two space indent"

   [indented-3]: https://example.com "Three space indent"

Use [indented-1], [indented-2], and [indented-3] links.

## Autolink Inside Emphasis

**<https://example.com>** in bold context.

*<http://other.org>* in italic context.

## Image with Title Containing Special Characters

![alt text](image.png "title with special chars: & < >")

## Link Adjacent to Code Span

`code`[link](https://example.com) adjacent.

[link](https://example.com)`code` other direction.

## Autolink Wrapped in Bold

**<https://example.com>** is important.

## Autolink Wrapped in Italic

*<http://other.org/path>* here.

## Autolink in List Item with Bold

- **<https://example.com>** first
- *<http://other.org>* second

## Image with Title Containing Escaped Quotes

![alt](image.png "title with \"escaped\" quotes")

## Multiple Autolinks on Same Line

<https://first.com> and <https://second.com> and <https://third.com> together.

## Autolink Adjacent to Punctuation

<https://example.com>.

<https://example.com>,

(<https://example.com>)

## Image in Blockquote

> ![screenshot](screenshot.png "Screenshot title")

## Multiple Reference Definitions with Same Key Case Variants

[ci-ref]: https://example.com/ci "CI Link"

Check [ci-ref] for status.

## Reference Link with Unicode in Text

[リンクテキスト][unicode-ref]

[unicode-ref]: https://example.com "Unicode Reference"

## Image Reference Style

![screenshot][img-ref2]

[img-ref2]: https://example.com/screenshot.png "Screenshot"

## Link with Unicode in URL

[unicode url](https://example.com/路径/页面)

## Link with Title Containing Unicode

[link](https://example.com "タイトル with unicode")

## Multiple Consecutive Reference Definitions

[ref-x]: https://x.com "X"
[ref-y]: https://y.com "Y"
[ref-z]: https://z.com

See [ref-x] and [ref-y] and [ref-z] here.

## Reference Definition After Multiple Blank Lines

Some content.


[far-ref]: https://far.com "Far Away"

Use [far-ref] link.

## Image with Reference Then Inline Link

![alt][img-inline-ref] then [click](https://example.com)

[img-inline-ref]: https://example.com/img.png "Image"

## Collapsed Reference Link Then Text

[collapsed-two][] is useful.

[collapsed-two]: https://example.com "Collapsed Two"

## Shortcut Reference Link in Bold

**[shortcut-bold]** here.

[shortcut-bold]: https://example.com "Bold Shortcut"

## Emphasis Inside Link Text

[**bold** link text](https://example.com)

[*italic* link text](https://example.com)

[**bold** and *italic* mixed](https://example.com)

[text **bold** text](https://example.com)

[text *italic* text](https://example.com)

## Links Inside Emphasis

**[link text](https://example.com)** is bold-wrapped.

*[link text](https://example.com)* is italic-wrapped.

***[link text](https://example.com)*** is bold-italic-wrapped.

## Images Inside Links

[![alt text](image.png)](https://example.com)

[![badge](https://img.shields.io/badge/status-ok-green)](https://example.com)

## Consecutive Emphasis Adjacent to Links

**bold**[link](https://example.com)*italic*

*italic*[link](https://example.com)**bold**

## Link Then Emphasis Then Link

[first](https://a.com) **bold** [second](https://b.com)

[first](https://a.com) *italic* [second](https://b.com)
