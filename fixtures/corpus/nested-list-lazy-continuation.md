# Nested list with lazy continuation indentation

A line beginning with `+ ` can become a nested list item inside a task, while
its following lazy continuation lines retain the nested marker's indentation.

- [x] Parent task text
  + nested item text
    continuation at the nested item's content column
  continuation at the parent item's content column
  another parent continuation line
