import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { JSX } from "react";
import { $getNodeByKey } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isFrontmatterNode } from "../lexical/nodes.ts";

type YamlToken = { text: string; cls: string | null };

function tokenizeYaml(source: string): YamlToken[][] {
  return source.split("\n").map((line) => {
    if (line.trimStart().startsWith("#")) {
      return [{ text: line, cls: "comment" }];
    }

    const kvMatch = line.match(/^(\s*)([\w][\w.\-]*\s*)(:\s*)(.*)/);
    if (kvMatch) {
      const [, indent, key = "", colon = "", value] = kvMatch;
      const tokens: YamlToken[] = [];
      if (indent) tokens.push({ text: indent, cls: null });
      tokens.push({ text: key, cls: "property" });
      tokens.push({ text: colon, cls: "punctuation" });
      if (value) tokens.push(...tokenizeValue(value));
      return tokens;
    }

    const listMatch = line.match(/^(\s*)(- )(.*)/);
    if (listMatch) {
      const [, indent, dash = "", value = ""] = listMatch;
      const tokens: YamlToken[] = [];
      if (indent) tokens.push({ text: indent, cls: null });
      tokens.push({ text: dash, cls: "punctuation" });
      tokens.push(...tokenizeValue(value));
      return tokens;
    }

    return [{ text: line, cls: null }];
  });
}

function tokenizeValue(value: string): YamlToken[] {
  const trimmed = value.trim();
  if (!trimmed) return [{ text: value, cls: null }];

  if (trimmed === "true" || trimmed === "false") {
    return [{ text: value, cls: "boolean" }];
  }
  if (trimmed === "null" || trimmed === "~") {
    return [{ text: value, cls: "keyword" }];
  }
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    return [{ text: value, cls: "number" }];
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return [{ text: value, cls: "string" }];
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return tokenizeInlineList(value);
  }

  return [{ text: value, cls: "string" }];
}

function tokenizeInlineList(value: string): YamlToken[] {
  const tokens: YamlToken[] = [];
  let i = 0;
  while (i < value.length && value[i] !== "[") {
    i++;
  }
  if (i > 0) tokens.push({ text: value.slice(0, i), cls: null });
  tokens.push({ text: "[", cls: "punctuation" });
  i++;

  const closeIdx = value.lastIndexOf("]");
  if (closeIdx > i) {
    const inner = value.slice(i, closeIdx);
    const items = inner.split(",");
    for (let j = 0; j < items.length; j++) {
      if (j > 0) tokens.push({ text: ",", cls: "punctuation" });
      const item = items[j]!;
      const trimmedItem = item.trim();
      if (!trimmedItem) {
        tokens.push({ text: item, cls: null });
      } else {
        const leadSpace = item.slice(0, item.indexOf(trimmedItem));
        if (leadSpace) tokens.push({ text: leadSpace, cls: null });
        tokens.push({ text: trimmedItem, cls: "string" });
        const trailSpace = item.slice(
          item.indexOf(trimmedItem) + trimmedItem.length,
        );
        if (trailSpace) tokens.push({ text: trailSpace, cls: null });
      }
    }
    tokens.push({ text: "]", cls: "punctuation" });
    if (closeIdx + 1 < value.length) {
      tokens.push({ text: value.slice(closeIdx + 1), cls: null });
    }
  } else {
    tokens.push({ text: value.slice(i), cls: null });
  }

  return tokens;
}

function HighlightedYaml({ source }: { source: string }) {
  const lines = useMemo(() => tokenizeYaml(source), [source]);
  return (
    <>
      {lines.map((tokens, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 && "\n"}
          {tokens.map((tok, tokIdx) =>
            tok.cls ? (
              <span key={tokIdx} className={`editor-code-token-${tok.cls}`}>
                {tok.text}
              </span>
            ) : (
              tok.text
            ),
          )}
        </span>
      ))}
    </>
  );
}

/** YAML frontmatter, highlighted and edited in place. */
export function FrontmatterView({
  value: content,
  nodeKey,
}: {
  value: string;
  nodeKey: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [localContent]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isFrontmatterNode(node)) {
          node.setValue(newContent);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="editor-frontmatter">
      <div className="editor-frontmatter__label">Frontmatter</div>
      <div className="editor-frontmatter__editor">
        <pre className="editor-frontmatter__highlight" aria-hidden="true">
          <HighlightedYaml source={localContent} />
        </pre>
        <textarea
          ref={textareaRef}
          className="editor-frontmatter__content"
          value={localContent}
          onChange={handleChange}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

