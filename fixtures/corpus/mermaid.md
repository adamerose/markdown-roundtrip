# Mermaid Diagrams

## Flowchart

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do something]
    B -->|No| D[Do something else]
    C --> E[End]
    D --> E
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob
    B-->>A: Hi Alice
    A->>B: How are you?
    B-->>A: Good, thanks!
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review
    Review --> Approved
    Review --> Draft: Revisions needed
    Approved --> Published
    Published --> [*]
```

## Regular Code Block (should remain as CodeNode)

```javascript
const x = 42;
console.log(x);
```

## Text After Mermaid

This paragraph follows the mermaid diagrams to verify nothing breaks the document flow.
