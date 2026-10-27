import { useState, useEffect, useRef, useCallback } from "react";
import type { JSX } from "react";
import { $getNodeByKey } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { PanzoomObject } from "@panzoom/panzoom";
import {
  Cursor,
  PencilSquare,
  ArrowsFullscreen,
  FullscreenExit,
  BoxArrowUpRight,
} from "react-bootstrap-icons";
import { $isMermaidNode } from "../lexical/nodes.ts";
import { host } from "./host.ts";
import { renderMermaid } from "../render/index.ts";

// ────────────────────────────────────────────────────────────────
// Lazy panzoom loading
// ────────────────────────────────────────────────────────────────
// Panzoom references `window` at module scope. Load lazily so headless
// Node.js tests (roundtrip) can import MermaidNode without error.

type PanzoomFactory = (
  elem: HTMLElement | SVGElement,
  options?: Record<string, unknown>,
) => PanzoomObject;
let panzoomFactory: PanzoomFactory | null = null;
let panzoomLoadPromise: Promise<PanzoomFactory> | null = null;

async function getPanzoom(): Promise<PanzoomFactory> {
  if (panzoomFactory) return panzoomFactory;
  if (!panzoomLoadPromise) {
    panzoomLoadPromise = import("@panzoom/panzoom").then((m) => {
      panzoomFactory = m.default;
      return panzoomFactory;
    });
  }
  return panzoomLoadPromise;
}

async function svgToPngBase64(svgHtml: string): Promise<string> {
  // Use a data: URL rather than URL.createObjectURL — the webview CSP allows
  // `data:` for `img-src` but not `blob:`, so a blob URL would silently fail
  // to load. btoa cannot encode non-Latin1 characters directly, so encode
  // to UTF-8 bytes first.
  const utf8Bytes = new TextEncoder().encode(svgHtml);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]!);
  }
  const dataUrl = `data:image/svg+xml;base64,${btoa(binary)}`;

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load SVG as image"));
    img.src = dataUrl;
  });
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth * scale;
  canvas.height = img.naturalHeight * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png").split(",")[1] ?? "";
}

// ────────────────────────────────────────────────────────────────
// Global active block tracking
// ────────────────────────────────────────────────────────────────
// Only one mermaid block can be active (active or edit mode) at a time.
// Each MermaidComponent registers itself. When one activates, it
// deactivates the previous one.

type DeactivateCallback = () => void;
let activeBlockDeactivate: DeactivateCallback | null = null;

function claimActiveBlock(deactivate: DeactivateCallback): void {
  if (activeBlockDeactivate && activeBlockDeactivate !== deactivate) {
    activeBlockDeactivate();
  }
  activeBlockDeactivate = deactivate;
}

function releaseActiveBlock(deactivate: DeactivateCallback): void {
  if (activeBlockDeactivate === deactivate) {
    activeBlockDeactivate = null;
  }
}

// ────────────────────────────────────────────────────────────────
// React component for rendering mermaid diagrams
// ────────────────────────────────────────────────────────────────

type MermaidMode = "inactive" | "active" | "edit";

// The editor shows the user's own files, as the extension always has.
const MERMAID_OPTIONS = () => ({ theme: host.theme(), securityLevel: "loose" as const });

/** A Mermaid diagram: rendered, then active (pan and zoom), then edited as source; see the caret design record. */
export function MermaidView({
  value: source,
  nodeKey,
}: {
  value: string;
  nodeKey: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<MermaidMode>("inactive");
  const [localSource, setLocalSource] = useState(source);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<PanzoomObject | null>(null);
  const activationClickRef = useRef(false);

  // Stable deactivation callback for global tracking
  const deactivateRef = useRef<DeactivateCallback>(() => {});
  deactivateRef.current = () => {
    setMode("inactive");
    setIsFullscreen(false);
  };
  const stableDeactivate = useCallback(() => {
    deactivateRef.current();
  }, []);

  // Sync prop changes when not editing
  useEffect(() => {
    if (mode !== "edit") setLocalSource(source);
  }, [source, mode]);

  // Render the mermaid diagram
  useEffect(() => {
    if (mode === "edit") return;

    let cancelled = false;
    (async () => {
      try {
        const rendered = await renderMermaid(source, MERMAID_OPTIONS());
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null);
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, nodeKey, mode]);

  // Re-render when VS Code theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setSvg(null);
      (async () => {
        try {
          const rendered = await renderMermaid(source, MERMAID_OPTIONS());
          setSvg(rendered);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [source, nodeKey]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [localSource, mode]);

  // ── Panzoom lifecycle for inline active mode ──────────────────
  useEffect(() => {
    if (mode !== "active" || !svgContainerRef.current) {
      // Reset and destroy panzoom when leaving active mode
      if (panzoomRef.current) {
        panzoomRef.current.reset({ animate: false });
        panzoomRef.current.destroy();
        panzoomRef.current = null;
      }
      return;
    }

    const el = svgContainerRef.current;
    let wheelHandler: ((e: WheelEvent) => void) | null = null;
    let destroyed = false;

    getPanzoom().then((createPanzoom) => {
      if (destroyed) return;
      const pz = createPanzoom(el, {
        cursor: "grab",
        noBind: false,
        animate: false,
        overflow: "visible",
      });
      panzoomRef.current = pz;

      const parent = containerRef.current;
      wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        pz.zoomWithWheel(e, { animate: false });
      };
      parent?.addEventListener("wheel", wheelHandler, { passive: false });
    });

    return () => {
      destroyed = true;
      if (wheelHandler) {
        containerRef.current?.removeEventListener("wheel", wheelHandler);
      }
      if (panzoomRef.current) {
        // Reset zoom/pan to default before destroying so the element's
        // transform style is cleared (destroy only unbinds listeners).
        panzoomRef.current.reset({ animate: false });
        panzoomRef.current.destroy();
        panzoomRef.current = null;
      }
    };
  }, [mode, svg, isFullscreen]);

  // ── Click outside to deactivate ───────────────────────────────
  useEffect(() => {
    if (mode === "inactive" && !isFullscreen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      if (container.contains(e.target as Node)) return;
      setMode("inactive");
      setIsFullscreen(false);
      releaseActiveBlock(stableDeactivate);
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, [mode, isFullscreen, stableDeactivate]);

  // ── Escape key to deactivate ──────────────────────────────────
  useEffect(() => {
    if (mode === "inactive" && !isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setMode("inactive");
        setIsFullscreen(false);
        releaseActiveBlock(stableDeactivate);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [mode, isFullscreen, stableDeactivate]);

  // ── Mode transition handlers ──────────────────────────────────

  const activateMode = useCallback(
    (newMode: MermaidMode) => {
      if (newMode === "inactive") {
        setMode("inactive");
        releaseActiveBlock(stableDeactivate);
      } else {
        claimActiveBlock(stableDeactivate);
        setMode(newMode);
      }
    },
    [stableDeactivate],
  );

  const handleDiagramClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent Lexical from handling this click (selecting the node, etc.)
      e.stopPropagation();

      if (mode === "inactive") {
        activateMode("active");
        // Mark that this click was the activation click
        activationClickRef.current = true;
        // Reset after a tick so subsequent clicks work for panning
        requestAnimationFrame(() => {
          activationClickRef.current = false;
        });
      }
      // In active mode, clicks are for panning (handled by panzoom)
      // In edit mode, this area isn't shown
    },
    [mode, activateMode],
  );

  const handleToolbarActive = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (mode === "active") {
        // Re-clicking active button deactivates
        activateMode("inactive");
      } else {
        activateMode("active");
      }
    },
    [mode, activateMode],
  );

  const handleToolbarEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (mode === "edit") {
        activateMode("inactive");
      } else {
        activateMode("edit");
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
    },
    [mode, activateMode],
  );

  const handleToolbarFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        claimActiveBlock(stableDeactivate);
        setIsFullscreen(true);
      }
    },
    [isFullscreen, stableDeactivate],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newSource = e.target.value;
      setLocalSource(newSource);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isMermaidNode(node)) {
          node.setValue(newSource);
        }
      });
    },
    [editor, nodeKey],
  );

  // Prevent textarea blur from deactivating — we handle deactivation
  // explicitly via Escape, click outside, or toolbar buttons
  const handleTextareaBlur = useCallback(() => {
    // No-op: do not deactivate on blur. The design doc explicitly
    // rejects blur-to-exit because blur fires unexpectedly when
    // clicking toolbar buttons.
  }, []);

  // ── Determine CSS classes ─────────────────────────────────────

  const blockClasses = [
    "editor-mermaid-block",
    mode === "active" && "editor-mermaid-block--active",
    mode === "edit" && "editor-mermaid-block--edit",
    isFullscreen && "editor-mermaid-block--fullscreen",
  ]
    .filter(Boolean)
    .join(" ");

  const toolbarVisible = mode !== "inactive" || isFullscreen;

  const handleOpenImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!svg) return;
      svgToPngBase64(svg)
        .then((data) => {
          host.openImage?.(data);
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          const stack = err instanceof Error ? err.stack : undefined;
          host.reportError(`Mermaid open-as-image failed: ${message}`, stack);
        });
    },
    [svg],
  );

  // ── Render ────────────────────────────────────────────────────

  const svgContent = svg ? (
    <div
      className="editor-mermaid-block__svg"
      ref={svgContainerRef}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : error ? (
    <div className="editor-mermaid-block__error">
      <div className="editor-mermaid-block__error-label">Render error</div>
      <pre className="editor-mermaid-block__source">{source}</pre>
    </div>
  ) : (
    <div className="editor-mermaid-block__loading">Rendering...</div>
  );

  return (
    <>
      {isFullscreen && <div className="editor-mermaid-backdrop" />}
      <div className={blockClasses} ref={containerRef}>
        <div className="editor-mermaid-block__label">Mermaid</div>

        <div
          className={`editor-mermaid-block__toolbar${toolbarVisible ? " editor-mermaid-block__toolbar--visible" : ""}`}
        >
          <button
            className={`editor-mermaid-block__toolbar-btn${mode === "active" ? " editor-mermaid-block__toolbar-btn--active-mode" : ""}`}
            onClick={handleToolbarActive}
            title="Pan & Zoom"
            type="button"
          >
            <Cursor size={14} />
          </button>
          <button
            className={`editor-mermaid-block__toolbar-btn${mode === "edit" ? " editor-mermaid-block__toolbar-btn--edit-mode" : ""}`}
            onClick={handleToolbarEdit}
            title="Edit source"
            type="button"
          >
            <PencilSquare size={14} />
          </button>
          <button
            className={`editor-mermaid-block__toolbar-btn${isFullscreen ? " editor-mermaid-block__toolbar-btn--fullscreen" : ""}`}
            onClick={handleToolbarFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            type="button"
          >
            {isFullscreen ? <FullscreenExit size={14} /> : <ArrowsFullscreen size={14} />}
          </button>
          <button
            className="editor-mermaid-block__toolbar-btn"
            onClick={handleOpenImage}
            title="Open as image"
            type="button"
          >
            <BoxArrowUpRight size={14} />
          </button>
        </div>

        {mode === "edit" ? (
          <div className="editor-mermaid-block__editor">
            <textarea
              ref={textareaRef}
              className="editor-mermaid-block__textarea"
              value={localSource}
              onChange={handleChange}
              onBlur={handleTextareaBlur}
              spellCheck={false}
            />
          </div>
        ) : (
          <div
            className={`editor-mermaid-block__content${mode === "active" ? " editor-mermaid-block__content--active" : ""}`}
            onClick={handleDiagramClick}
          >
            {svgContent}
          </div>
        )}
      </div>
    </>
  );
}

