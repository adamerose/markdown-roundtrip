## Simple Table

| Name | Age | City |
| --- | --- | --- |
| Alice | 30 | London |
| Bob | 25 | Paris |

## Aligned Columns

| Left Aligned | Center Aligned | Right Aligned |
| :--- | :---: | ---: |
| Row 1 Col 1 | Row 1 Col 2asd | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |
| Longer content | Centered | $1.99 |
| Short | Yes | $1,234.567 |

## All Alignment Types

| Left | Center | Right | Default |
| :--- | :---: | ---: | --- |
| L1 | C1 | R1 | D1 |
| Long left | Centered | 12345 | Normal |

## Single Column Table

| Solo |
| --- |
| one |
| two |
| three |

## Minimal Table

| A |
| - |
| 1 |

## Wide Table with Many Columns

| A | B | C | D | E | F | G | H | I | J |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |

## Table with Inline Formatting

| Feature | Syntax | Rendered |
| --- | --- | --- |
| Bold | `**bold**` | **bold** |
| Italic | `*italic*` | *italic* |
| Code | `` `code` `` | `code` |
| Strikethrough | `~~strike~~` | ~~strike~~ |
| Link | `[text](url)` | [Google](https://google.com) |
| Combined | `***bold italic***` | ***bold italic*** |

## Table with Empty Cells

| A | B | C |
| --- | --- | --- |
|  | middle |  |
| left |  | right |
|  |  |  |

## Table with All Empty Cells

| A | B | C |
| --- | --- | --- |
|  |  |  |
| x |  | z |

## Table with Header Only (No Data Rows)

| Col A | Col B | Col C |
| --- | --- | --- |

## Escaped Pipes in Cells

| Expression | Result |
| --- | --- |
| `a \| b` | a or b |
| `x \| y \| z` | x or y or z |

## Table with Code Containing Pipes

| Expression | Result |
| --- | --- |
| `a \| b` | Bitwise OR |
| `x && y` | Logical AND |

## Compact Table

| a | b | c |
| --- | --- | --- |
| 1 | 2 | 3 |
| 4 | 5 | 6 |

## Table with Very Long Cell Content

| Short | A cell with a very long amount of text that goes on and on to test wrapping and overflow handling |
| --- | --- |
| X | Another long cell to see how the system handles multi-line looking cell content in a single line |

## Table with URLs in Cells

| Service | URL |
| --- | --- |
| Production | https://api.example.com |
| Staging | https://staging.example.com |
| Local | http://localhost:3000 |

## Table with Links

| Column |
| --- |
| [link](http://example.com) |

## Table Without Outer Pipes

A | B | C
--- | --- | ---
1 | 2 | 3
4 | 5 | 6

## Table Without Outer Pipes with Alignment

Left | Center | Right
:--- | :---: | ---:
L | C | R
Data | Data | Data

## Table with Long Definition Content

| Term | Definition |
| --- | --- |
| Markdown | A lightweight markup language with plain-text formatting syntax designed so that it can be converted to HTML and many other formats |
| GFM | GitHub Flavored Markdown, a dialect of Markdown that is supported for content on GitHub |

## Numeric Data Table

| Metric | Q1 | Q2 | Q3 | Q4 |
| --- | --- | --- | --- | --- |
| Revenue | $12,500 | $14,200 | $13,800 | $16,100 |
| Expenses | $9,800 | $10,100 | $9,950 | $11,200 |
| Net Income | $2,700 | $4,100 | $3,850 | $4,900 |

## Multiple Tables in Sequence

| Table A |
| --- |
| Row A |

| Table B |
| --- |
| Row B |

| Table C |
| --- |
| Row C |

## Table Followed by Paragraph

| A | B |
| --- | --- |
| 1 | 2 |

This paragraph immediately follows the table.

## Table Immediately After Heading

### Data
| Key | Value |
| --- | --- |
| name | test |
| version | 1.0 |

## Table Followed by Code

| A | B |
| --- | --- |
| 1 | 2 |

```
Code after table.
```

## Table Followed by List

| A | B |
| --- | --- |
| 1 | 2 |

- List after table
- Second item

## Table Followed by Blockquote

| A | B |
| --- | --- |
| 1 | 2 |

> Quote after table.

## Table Followed by Horizontal Rule

| A | B |
| --- | --- |
| 1 | 2 |

---

## Table Adjacency: No Blank Before

Paragraph before table.
| A | B |
| --- | --- |
| 1 | 2 |

## Table Adjacency: No Blank After

| A | B |
| --- | --- |
| 1 | 2 |
Paragraph after table.

## Table Then HR No Blank

| A | B |
| --- | --- |
| 1 | 2 |
---

## Table Then Heading No Blank

| A | B |
| --- | --- |
| 1 | 2 |
## Heading After Table

## Table Then Code No Blank

| A | B |
| --- | --- |
| 1 | 2 |
```
code after table
```

## Table Then List No Blank

| A | B |
| --- | --- |
| 1 | 2 |
- List item after table

## Table with Bold and Italic Mixed

| **Bold** and *italic* | `code` and ~~strike~~ |
| --- | --- |
| **bold** *italic* | ~~strike~~ `code` |

## Table with Link in Cell

| Name | URL |
| --- | --- |
| Example | [link](https://example.com) |
| Google | [google](https://google.com) |

## Two-Column Table Minimal Separator

| A | B |
| - | - |
| 1 | 2 |

## Table with Only One Data Row

| Singleton |
| --- |
| value |

## Table with Numbers and Alignment

| Left | Right |
| :--- | ---: |
| abc | 123 |
| def | 456 |

## Table After Code Block No Blank

```
some code
```
| A | B |
| --- | --- |
| 1 | 2 |

## Table After Blockquote No Blank

> A quote.
| A | B |
| --- | --- |
| 1 | 2 |

## Table with Emphasis in Header

| **Bold Header** | *Italic Header* |
| --- | --- |
| normal | normal |

## Single Cell Single Row

| Only |
| --- |
| one |

## Table with Code Span Having Pipe

| Code | Result |
| --- | --- |
| `a \| b` | OR |

## HTML Table

## Table with Extra Long Separator Dashes

| Left | Center | Right |
| :---------- | :------------: | ----------: |
| data | data | data |

## Table with Minimal and Extended Separators Mixed

| A | B | C |
| - | ---------- | :--: |
| 1 | 2 | 3 |

## Table Immediately Followed by Code Fence No Blank

| A | B |
| --- | --- |
| 1 | 2 |
```
code right after table
```

## Table with Code Span and Emphasis in Same Cell

| Feature | Example |
| --- | --- |
| Both | `code` and **bold** together |
| Mixed | *italic* then `more code` here |

<table>
  <colgroup>
    <col style="width: 149px" />
    <col style="width: 97px" />
    <col style="width: 111px" />
  </colgroup>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
      <th>Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data A1</td>
      <td>Data A2</td>
      <td>Data A3</td>
    </tr>
    <tr>
      <td>Data B1</td>
      <td>Data B2</td>
      <td>Data B3</td>
    </tr>
  </tbody>
</table>

## Table with Mixed Emphasis Delimiters

| __Underscore Bold__ | **Star Bold** | _Underscore Italic_ | *Star Italic* |
| --- | --- | --- | --- |
| __cell1__ | **cell2** | _cell3_ | *cell4* |
| **mixed1** | __mixed2__ | *mixed3* | _mixed4_ |

## Table with Autolink in Cell

| Service | Link |
| --- | --- |
| Main | <https://example.com> |
| Backup | <http://backup.org> |

## Table with Strikethrough in Cell

| Feature | Status |
| --- | --- |
| Legacy | ~~removed~~ |
| Current | **active** |

## Table with Image in Cell

| Preview | Description |
| --- | --- |
| ![thumb](img.png) | A thumbnail |

## Table Immediately After Setext Heading

Setext Before Table
---
| A | B |
| --- | --- |
| 1 | 2 |

## Table with Unicode in Cells

| 名前 | 年齢 | 都市 |
| --- | --- | --- |
| アリス | 30 | 東京 |
| ボブ | 25 | 大阪 |

## Table with Emphasis and Code Mixed in Single Cell

| Cell |
| --- |
| **bold** then `code` then *italic* end |
| `code` **bold** `more code` |

## Table with Nested Emphasis in Cells

| Formatting |
| --- |
| ***bold italic*** in cell |
| ~~**struck bold**~~ here |

## Table with Autolink and Bold in Same Cell

| Service | Details |
| --- | --- |
| Main | **primary** <https://example.com> |
| Backup | *secondary* <http://backup.org> |

## Table with Long Separator Colons

| Left | Center | Right |
| :---------- | :----------: | ----------: |
| left data | center data | right data |

## Table Separator Single Char with Colons

| L | C | R |
| :- | :-: | -: |
| a | b | c |
