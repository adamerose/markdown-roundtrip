## Dash Bullet List (Tight)

- Dash item one
- Dash item two
- Dash item three

## Star Bullet List (Tight)

* Star item one
* Star item two
* Star item three

## Plus Bullet List (Tight)

+ Plus item one
+ Plus item two
+ Plus item three

## Loose Bullet List

- Alpha

- Beta

- Gamma

## Loose Star Bullet

* First

* Second

* Third

## Loose Plus Bullet

+ First

+ Second

+ Third

## Ordered List (Tight)

1. First
2. Second
3. Third

## Ordered List (Loose)

1. Item one

2. Item two

3. Item three

## Ordered List Starting at 0

0. Zero
1. One
2. Two

## Ordered List Starting at 5

5. Fifth
6. Sixth
7. Seventh

## Ordered List Starting at 100

100. One hundred
101. One hundred one
102. One hundred two

## Very Large Start Number

999999999. Very large start
999999999. Next item

## Ordered List with Paren Style

1) Paren style
2) Paren style

## Ordered List Same Numbers (CommonMark)

1. First
1. Also first
1. Still first

## Nested Unordered (2-Space Indent)

- Level 0
  - Level 1
    - Level 2
      - Level 3
  - Back to 1
- Back to 0

## Nested Unordered (4-Space Indent)

- outer
  - inner
    - deep inner
      - Level 3
        - Level 4

## Nested Ordered (3-Space Indent)

1. Level 0
   1. Level 1
      1. Level 2
         1. Level 3
   2. Back to 1
2. Back to 0

## Mixed Nested (Ordered Parent, Unordered Child)

1. Ordered parent
  - Unordered child 1
  - Unordered child 2
2. Another ordered

## Mixed Nested (Unordered Parent, Ordered Child)

- Unordered parent
   1. Ordered child 1
   2. Ordered child 2
- Another unordered

## Deeply Nested Mixed Types

1. First ordered
  - Unordered inside ordered
      1. Ordered again
    - And unordered again
         1. Fifth level ordered

## Alternating List Types

1. Ordered
  - Unordered
      1. Ordered
    - Unordered
2. Back to top ordered
  - Sub unordered

## Nested Lists with Different Markers

- Dash outer
  * Star inner
    + Plus deep inner

## Task List Tight

- [x] Done one
- [ ] Todo one
- [x] Done two

## Task List Loose

- [x] Done one

- [ ] Todo one

- [x] Done two

## Task List Nested

- [x] Parent done
  - [x] Child done
  - [ ] Child todo
- [ ] Parent todo
  - [ ] All children todo
    - [x] Deeply nested done

## Task Items Mixed with Regular

- [x] Task done
- Regular item
- [ ] Task todo

## List with Formatted Items

- **Bold item** followed by plain text
- *Italic item* followed by plain text
- `Code item` followed by plain text
- ~~Strikethrough~~ followed by plain text
- [Link](https://example.com) followed by plain text

## List with Formatted Content (Ordered)

1. **Bold first**
2. *Italic second*
3. `Code third`
4. ~~Struck fourth~~
5. [Link fifth](https://example.com)
6. Normal sixth

## Single Item Lists

- Sole bullet item

1. Sole ordered item

- [x] Sole task item

## List Then Paragraph

- Item one
- Item two

Paragraph after list.

## Paragraph Then List

Paragraph before list.

- Item one
- Item two

## Two Lists Separated by Paragraph

- First list item 1
- First list item 2

Some paragraph text.

- Second list item 1
- Second list item 2

## Ordered Then Unordered

1. Ordered one
2. Ordered two

- Unordered one
- Unordered two

## Unordered Then Ordered

- Unordered one
- Unordered two

1. Ordered one
2. Ordered two

## Ordered Then Unordered No Blank

1. Ordered one
2. Ordered two
- Unordered one
- Unordered two

## Continuation Lines

- This is a list item
  with a continuation line

- This item has
  two continuation
  lines here

1. Ordered item
   with continuation

2. Another ordered
   with continuation too

## Continuation with Inline Formatting

- This has **bold
  continuation** text

- And *italic
  continuation* here

## Multi-Paragraph List Items

1. First paragraph.

   Second paragraph.

2. Third paragraph.

   Fourth paragraph.

## Nested Loose List

- Level 1 item one

  - Level 2 item one
  - Level 2 item two

- Level 1 item two

  - Level 2 item three

## Empty List Items

- 
- Non-empty item
- 
- Another non-empty item

## List Immediately After Paragraph

This is a paragraph.

- This might or might not be a list depending on parser
- Second item

## Task List Then Regular List

- [x] Done
- [ ] Pending

- Regular item 1
- Regular item 2

## List with Single Character Items

- a
- b
- c
- d

## Blockquote with Loose List Inside

> - First item
>
> - Second item
>
> - Third item

## Blockquote with Tight List Then Paragraph

> - Tight one
> - Tight two
>
> Paragraph after tight list.

## List with Blockquote Inside

- List item

  > Blockquote in list
  >
  > ```python
  > def hello():
  >     return "world"
  > ```
  >
  > After the fence

## Simple Blockquote in List

- Item one

  > Just a quote

- Item two

## List Then Table

- Item one
- Item two

| A | B |
| --- | --- |
| 1 | 2 |

## List Then Code Block

- Item one
- Item two

```
code between lists
```

- Third item in new list
- Fourth item

## Tight List Then Code Block Then Tight List

- Alpha
- Beta

```
code between lists
```

- Gamma
- Delta

## Ordered List High Start Then Code

42. Item forty-two
43. Item forty-three

```
code after numbered list
```

## List Marker Preservation (Star Dominance)

* Top level star one
* Top level star two
* Top level star three

## Multi-Paragraph with Code Block Inside

1. First item paragraph.

   Second paragraph for first item.

   ```python
   code_in_list = True
   ```

   Third paragraph after code.

2. Second item.

## List Item with Blockquote and Continuation

- Item with a blockquote:

  > Quoted text inside a list item.
  >
  > Second paragraph of quote.

- Next item.

## Three-Level Nested Ordered Lists

1. Level 0 item
   1. Level 1 item
      1. Level 2 item
   2. Back to level 1
2. Back to level 0

## Tight List with Trailing Content

- one
- two
- three

## Ordered List All Same Number (1)

1. First
1. Second
1. Third
1. Fourth

## Mixed Marker Nested Deep

- Dash level 0
  * Star level 1
    + Plus level 2
      - Dash level 3
        * Star level 4

## Loose List Single Item

- Only item in a loose list

## Ordered Two Digit Start

10. Ten
11. Eleven
12. Twelve

## Ordered Paren Loose

1) First item

2) Second item

3) Third item

## Nested Task List with Continuation

- [x] Done item with
  continuation line
  - [ ] Nested todo
  - [x] Nested done

## List Item with Bold and Link

- **Bold text** and [link](https://example.com) together
- *Italic* then `code` then ~~strike~~

## Ordered with All Formatting

1. **Bold** text here
2. *Italic* text here
3. `Code` text here
4. ~~Strike~~ text here
5. [Link](https://example.com) text here
6. **[Bold link](https://example.com)** here

## Tight Then Loose Same Marker

- Tight one
- Tight two

- Loose one

- Loose two

## Star Ordered Nested in Dash Unordered

- Outer dash
   1. Inner ordered one
   2. Inner ordered two
- Another outer

## Long Ordered List

1. First
2. Second
3. Third
4. Fourth
5. Fifth
6. Sixth
7. Seventh
8. Eighth
9. Ninth
10. Tenth

## Task List in Ordered Parent

1. First ordered
  - [x] Subtask done
  - [ ] Subtask pending
2. Second ordered

## Two Separate Lists Same Page

- List A item 1
- List A item 2

Separator paragraph.

- List B item 1
- List B item 2

Another separator.

* List C with star 1
* List C with star 2

## Nested Lists with Emphasis

- **Bold item** at top
  - *Italic nested*
    - `Code deep nested`
- Back to top

## List with URLs

- Check https://example.com for details
- Also see https://other.org here
- Email support@example.com

## Ordered List then Indented Code

1. First step
2. Second step
3. Third step

    indented code after steps

## List Item with Multiple Inline Formats

- **bold** and *italic* and `code` and ~~strike~~ all together
- [link](https://example.com) and **[bold link](https://other.com)**

## Ordered List > 9 with Continuation

10. First item with number > 9
    and a continuation line here
11. Second item with number > 9
    with continuation too
12. Third item plain

## Ordered List Starting at 99 Loose

99. Ninety-nine

100. One hundred

101. One hundred one

## Indented Code After Two-Digit Ordered List

10. Item ten
11. Item eleven

    indented code after two-digit ordered list

## Image as Only Content in List Item

- ![image alt](photo.png)
- Regular item after

## Task List Items with Bold and Italic Content

- [x] **Bold done task** with trailing text
- [ ] *Italic pending task* here
- [x] `Code done task` value
- [ ] ~~Struck pending~~ task

## Three-Level Mixed Ordered Unordered Nesting

1. Outer ordered
  - Middle unordered
      1. Inner ordered one
      2. Inner ordered two
  - Middle unordered two
2. Outer ordered two
  - Middle again
    + Deep plus item

## Autolink Inside List Item

- See <https://example.com> for details
- Also <http://other.org/path>

## Reference Link in List Item

- Check [ref link][list-ref] here
- Another [ref][list-ref] usage

[list-ref]: https://example.com "List Reference"

## List Items with Mixed Emphasis Styles

- __underscore bold__ item
- **star bold** item
- _underscore italic_ item
- *star italic* item
- __bold1__ and **bold2** on same item
- *italic1* and _italic2_ on same item

## Multiple Paragraphs in List Item with Emphasis

- First paragraph with **star bold** text.

  Second paragraph with __underscore bold__ text.

  Third paragraph with *star italic* and _underscore italic_ together.

- Another item with __bold__ content.

## Ordered List at 10+ with Sub-list Different Marker

10. Tenth item
11. Eleventh item
  - Dash sub-item one
  - Dash sub-item two
12. Twelfth item
  * Star sub-item one
  * Star sub-item two
13. Thirteenth item
  + Plus sub-item one

## Ordered List Starting at High Number with Continuation

99. Item ninety-nine with a long paragraph
    that continues on the next line.
100. Item one hundred
     with continuation text here.
101. Item one hundred one

## Tight Sublist Inside Loose List

- Loose item one

- Loose item two
  - Tight sub one
  - Tight sub two

- Loose item three

## Loose List with Nested Ordered Sublist

- Outer one

- Outer two
   1. Inner ordered one
   2. Inner ordered two

- Outer three

## Three Levels Loose-Tight-Tight

- Level 0 item one

- Level 0 item two
  - Level 1 item one
    - Level 2 item one
    - Level 2 item two
  - Level 1 item two

- Level 0 item three

## Five Level Deep Nesting

- Level 0
  - Level 1
    - Level 2
      - Level 3
        - Level 4
          - Level 5

## Task List with Nested Paragraph

- [x] Completed task

  Additional paragraph for completed task.

- [ ] Pending task

  Extra details for pending task.

## Task List with Code Block Inside Item

- [x] Task with code:

  ```python
  def done():
      return True
  ```

- [ ] Another task

## Ordered List Starting at 0 Loose

0. Zero item

1. One item

2. Two item

## Nested Lists Star Then Plus Then Dash

* Star outer
  + Plus middle
    - Dash inner

## List with Autolink and Bold on Same Item

- **Important:** <https://example.com> visit now
- *See:* <http://other.org> for details

## Ordered List Paren with Continuation

1) First paren item
   with continuation
2) Second paren item
   also continued

## List Item with Multiple Paragraphs and Emphasis

1. **First paragraph** of first item.

   *Second paragraph* of first item.

2. Regular second item.

## List Items Starting with Emphasis

- **Bold start** then normal
- *Italic start* then normal
- `Code start` then normal
- ~~Strike start~~ then normal

## List Items Starting with Code Span

- `code` is the first word
- `another code` followed by text
- `code`text with no space

## Ordered List Starting with Emphasis

1. **Bold first** and rest
2. *Italic second* and rest
3. `Code third` and rest

## Mixed Bullet and Ordered at Same Level

- Bullet item one
- Bullet item two

1. Ordered item one
2. Ordered item two

- Bullet again

## Consecutive Different Marker Types

- Dash item

* Star item

+ Plus item
