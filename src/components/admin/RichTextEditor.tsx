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

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const syncValue = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    syncValue();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  return (
    <div className={cn("rounded-md border border-border overflow-hidden", className)}>
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
        <button type="button" className={toolbarBtn} onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarBtn} onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarBtn} onClick={() => exec("formatBlock", "h2")} title="Heading">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarBtn} onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarBtn} onClick={() => exec("insertOrderedList")} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarBtn} onClick={addLink} title="Link">
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        className="min-h-[220px] max-h-[400px] overflow-y-auto bg-background px-4 py-3 text-sm leading-relaxed text-foreground focus:outline-none prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        onInput={syncValue}
        onBlur={syncValue}
        suppressContentEditableWarning
      />
    </div>
  );
}
