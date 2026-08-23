import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Palette } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '150px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from props only on initial load or if it changes significantly from outside
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Don't update if it's just a focus change
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleChange();
  };

  const handleLink = () => {
    const url = prompt('Enter the URL:', 'https://');
    if (url) {
      exec('createLink', url);
    }
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('foreColor', e.target.value);
  };

  const handleFont = (e: React.ChangeEvent<HTMLSelectElement>) => {
    exec('fontName', e.target.value);
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-[#CCCCCC] rounded-md overflow-hidden bg-white flex flex-col">
      <div className="bg-[#FAF9F6] border-b border-[#CCCCCC] px-3 py-2 flex flex-wrap items-center gap-2 text-gray-600">
        <select onChange={handleFont} className="text-xs border border-gray-300 rounded px-1 py-1 bg-white" defaultValue="">
          <option value="" disabled>Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia, serif">Serif (Georgia)</option>
          <option value="sans-serif">Sans-Serif</option>
          <option value="Courier New">Monospace</option>
        </select>
        <span className="w-px h-4 bg-gray-300 mx-1"></span>
        <button type="button" onClick={() => exec('bold')} className="p-1 hover:bg-gray-200 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('italic')} className="p-1 hover:bg-gray-200 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('underline')} className="p-1 hover:bg-gray-200 rounded" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        <span className="w-px h-4 bg-gray-300 mx-1"></span>
        <button type="button" onClick={handleLink} className="p-1 hover:bg-gray-200 rounded" title="Add Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="relative flex items-center p-1 hover:bg-gray-200 rounded cursor-pointer" title="Text Color">
          <Palette className="w-4 h-4" />
          <input 
            type="color" 
            onChange={handleColor} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleChange}
        onBlur={handleChange}
        className="w-full px-3 py-3 text-xs focus:outline-none focus:ring-0 font-sans overflow-y-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
