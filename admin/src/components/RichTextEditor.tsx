import { useRef, useEffect } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, label, error, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="rich-text-editor">
      {label && <label className="editor-label">{label}</label>}
      
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="toolbar-btn"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="toolbar-btn"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="toolbar-btn"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="toolbar-btn"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="toolbar-btn"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="toolbar-btn"
          title="Paragraph"
        >
          P
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="toolbar-btn"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="toolbar-btn"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={insertLink}
          className="toolbar-btn"
          title="Insert Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => execCommand('unlink')}
          className="toolbar-btn"
          title="Remove Link"
        >
          Unlink
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`editor-content ${error ? 'error' : ''}`}
        data-placeholder={placeholder || 'Start writing...'}
      />

      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default RichTextEditor;
