import { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const toolbarBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-foreground hover:bg-muted transition-colors";

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI"]);

function getSelectionRange(editor: HTMLElement): Range | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function restoreSelectionRange(editor: HTMLElement, range: Range | null) {
  editor.focus();
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  if (range) {
    sel.addRange(range);
  } else {
    const end = document.createRange();
    end.selectNodeContents(editor);
    end.collapse(false);
    sel.addRange(end);
  }
}

function getBlockElement(node: Node, editor: HTMLElement): HTMLElement | null {
  let el: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  let lastBlock: HTMLElement | null = null;

  while (el && el !== editor) {
    if (el instanceof HTMLElement && BLOCK_TAGS.has(el.tagName)) {
      lastBlock = el;
    }
    el = el.parentElement;
  }
  return lastBlock;
}

function isInsideList(block: HTMLElement | null): boolean {
  if (!block) return false;
  return Boolean(block.closest("ul, ol"));
}

function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function replaceBlock(block: HTMLElement, newTag: string) {
  const next = document.createElement(newTag);
  next.innerHTML = block.innerHTML || "<br>";
  block.replaceWith(next);
  placeCaretAtEnd(next);
  return next;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const syncValue = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const ensureEditorReady = (editor: HTMLElement) => {
    const empty =
      !editor.innerHTML ||
      editor.innerHTML === "<br>" ||
      editor.textContent?.trim() === "";
    if (empty) {
      editor.innerHTML = "<p><br></p>";
    }
  };

  const saveSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    savedRangeRef.current = getSelectionRange(editor);
  };

  const runWithSelection = (action: (editor: HTMLElement) => void) => {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelectionRange(editor, savedRangeRef.current);
    ensureEditorReady(editor);
    action(editor);
    syncValue();
  };

  const exec = (command: string, val?: string) => {
    runWithSelection(() => {
      document.execCommand(command, false, val);
    });
  };

  /** Toggle H2 ↔ paragraph on the current line/block */
  const toggleHeading = () => {
    runWithSelection((editor) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const block = getBlockElement(range.commonAncestorContainer, editor);

      if (!block || isInsideList(block)) {
        document.execCommand("formatBlock", false, "h2");
        return;
      }

      if (block.tagName === "H2") {
        replaceBlock(block, "p");
      } else {
        replaceBlock(block, "h2");
      }
    });
  };

  /** Use native list commands only — no placeholder text injection */
  const toggleList = (ordered: boolean) => {
    runWithSelection((editor) => {
      const command = ordered ? "insertOrderedList" : "insertUnorderedList";
      document.execCommand(command);
    });
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
  };

  return (
    <div className={cn("rounded-md border border-border overflow-hidden", className)}>
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
        <button
          type="button"
          className={toolbarBtn}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleHeading}
          title="Heading (toggle)"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => toggleList(false)}
          title="Bullet list (toggle)"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => toggleList(true)}
          title="Numbered list (toggle)"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onMouseDown={handleToolbarMouseDown}
          onClick={addLink}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        className="min-h-[220px] max-h-[400px] overflow-y-auto bg-background px-4 py-3 text-sm leading-relaxed text-foreground focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1"
        onInput={syncValue}
        onBlur={syncValue}
        onFocus={() => {
          const editor = editorRef.current;
          if (editor) ensureEditorReady(editor);
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        suppressContentEditableWarning
      />
    </div>
  );
}
