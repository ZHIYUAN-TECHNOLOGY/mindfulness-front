import { useEffect, useRef, useState } from "react";

interface RichTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function RichTextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
  className = "",
}: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Only update innerHTML when the prop differs to avoid clobbering the cursor.
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarBtn =
    "px-2.5 py-1.5 rounded text-xs font-medium text-gold-pale border border-gold-light/20 hover:bg-gold-primary/10 transition";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => exec("bold")}
          className={toolbarBtn}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className={toolbarBtn}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className={toolbarBtn}
          title="Underline"
        >
          <span className="underline">U</span>
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={() => setHasFocus(false)}
        onFocus={() => setHasFocus(true)}
        data-placeholder={placeholder}
        className={`w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale placeholder-gold-light/40 focus:outline-none focus:border-gold-primary overflow-y-auto ${
          hasFocus ? "border-gold-primary" : ""
        }`}
        style={{
          minHeight: `${Math.max(rows * 24, 96)}px`,
          lineHeight: 1.6,
        }}
      />

      {!value && placeholder && !hasFocus && (
        <div className="text-xs text-gold-light/40 -mt-1">
          {placeholder}
        </div>
      )}
    </div>
  );
}
