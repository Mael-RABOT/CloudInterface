import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, theme, Tooltip, Space } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  SaveOutlined,
  ClearOutlined,
  UndoOutlined,
  RedoOutlined,
  HighlightOutlined,
  CodeOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useDeviceDetection } from '../utils/deviceDetection';

const { TextArea } = Input;

interface EditorProps {
  content?: string;
  filename?: string;
  fileId?: number;
  onSave?: (fileId: number, content: string, filename: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

interface EditorState {
  content: string;
  title: string;
  selectionStart: number;
  selectionEnd: number;
  history: string[];
  historyIndex: number;
}

const Editor: React.FC<EditorProps> = ({
  content = '',
  filename = 'Untitled Document',
  fileId,
  onSave,
  readOnly = false,
  placeholder = 'Start typing your document...',
  autoFocus = true,
  style
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useDeviceDetection();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [state, setState] = useState<EditorState>({
    content: content,
    title: filename,
    selectionStart: 0,
    selectionEnd: 0,
    history: [content],
    historyIndex: 0
  });

  const [isModified, setIsModified] = useState(false);

  // Update content when prop changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      content: content,
      title: filename,
      history: [content],
      historyIndex: 0
    }));
    setIsModified(false);
  }, [content, filename]);

  // Update selection state when textarea changes
  const updateSelection = () => {
    if (textareaRef.current) {
      setState(prev => ({
        ...prev,
        selectionStart: textareaRef.current!.selectionStart,
        selectionEnd: textareaRef.current!.selectionEnd
      }));
    }
  };

  // Handle text changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), newContent];

    setState(prev => ({
      ...prev,
      content: newContent,
      history: newHistory,
      historyIndex: newHistory.length - 1
    }));

    setIsModified(true);
  };

  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, title: e.target.value }));
    setIsModified(true);
  };

  // Get selected text
  const getSelectedText = (): string => {
    return state.content.substring(state.selectionStart, state.selectionEnd);
  };

  // Replace selected text
  const replaceSelectedText = (newText: string) => {
    const before = state.content.substring(0, state.selectionStart);
    const after = state.content.substring(state.selectionEnd);
    const newContent = before + newText + after;

    setState(prev => ({
      ...prev,
      content: newContent,
      history: [...prev.history.slice(0, prev.historyIndex + 1), newContent],
      historyIndex: prev.historyIndex + 1
    }));

    setIsModified(true);

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current && textareaRef.current.setSelectionRange) {
        textareaRef.current.focus();
        const newCursorPos = state.selectionStart + newText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Text formatting functions
  const formatText = (format: string) => {
    const selectedText = getSelectedText();
    let formattedText = selectedText;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'highlight':
        formattedText = `==${selectedText}==`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'list-ordered':
        formattedText = selectedText.split('\n').map(line => `1. ${line}`).join('\n');
        break;
      case 'list-unordered':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'heading1':
        formattedText = `# ${selectedText}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
    }

    replaceSelectedText(formattedText);
  };

  // Undo/Redo functions
  const undo = () => {
    if (state.historyIndex > 0) {
      setState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex - 1,
        content: prev.history[prev.historyIndex - 1]
      }));
      setIsModified(true);
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      setState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex + 1,
        content: prev.history[prev.historyIndex + 1]
      }));
      setIsModified(true);
    }
  };

  // Save function
  const handleSave = () => {
    if (onSave && fileId) {
      onSave(fileId, state.content, state.title);
      setIsModified(false);
    }
  };

  // Clear function
  const handleClear = () => {
    setState(prev => ({
      ...prev,
      content: '',
      history: [''],
      historyIndex: 0
    }));
    setIsModified(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'b':
            e.preventDefault();
            formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            formatText('italic');
            break;
          case 'u':
            e.preventDefault();
            formatText('underline');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.content, state.historyIndex]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Mobile toolbar items
  const mobileToolbarItems = [
    { key: 'bold', icon: <BoldOutlined />, tooltip: 'Bold (Ctrl+B)', format: 'bold' },
    { key: 'italic', icon: <ItalicOutlined />, tooltip: 'Italic (Ctrl+I)', format: 'italic' },
    { key: 'underline', icon: <UnderlineOutlined />, tooltip: 'Underline (Ctrl+U)', format: 'underline' },
    { key: 'code', icon: <CodeOutlined />, tooltip: 'Code', format: 'code' },
  ];

  // Desktop toolbar items
  const desktopToolbarItems = [
    ...mobileToolbarItems,
    { key: 'strikethrough', icon: <StrikethroughOutlined />, tooltip: 'Strikethrough', format: 'strikethrough' },
    { key: 'highlight', icon: <HighlightOutlined />, tooltip: 'Highlight', format: 'highlight' },
    { key: 'link', icon: <LinkOutlined />, tooltip: 'Link', format: 'link' },
    { key: 'list-ordered', icon: <OrderedListOutlined />, tooltip: 'Ordered List', format: 'list-ordered' },
    { key: 'list-unordered', icon: <UnorderedListOutlined />, tooltip: 'Unordered List', format: 'list-unordered' },
  ];

  const toolbarItems = isMobile ? mobileToolbarItems : desktopToolbarItems;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      fontFamily: token.fontFamily,
      ...style
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? token.paddingSM : token.paddingMD,
        borderBottom: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? token.marginXS : token.marginSM
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Input
            value={state.title}
            onChange={handleTitleChange}
            placeholder="Document title..."
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              fontSize: isMobile ? '14px' : '16px',
              border: 'none',
              background: 'transparent',
              padding: 0
            }}
            readOnly={readOnly}
          />
        </div>

        <Space size={isMobile ? 'small' : 'middle'} wrap={isMobile}>
          {!readOnly && (
            <>
              <Button
                size={isMobile ? "small" : "middle"}
                icon={<UndoOutlined />}
                onClick={undo}
                disabled={state.historyIndex === 0}
                style={{
                  fontFamily: token.fontFamily,
                  minHeight: isMobile ? '32px' : 'auto',
                  backgroundColor: '#000000',
                  borderColor: '#00ff00',
                  color: '#00ff00',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
              <Button
                size={isMobile ? "small" : "middle"}
                icon={<RedoOutlined />}
                onClick={redo}
                disabled={state.historyIndex === state.history.length - 1}
                style={{
                  fontFamily: token.fontFamily,
                  minHeight: isMobile ? '32px' : 'auto',
                  backgroundColor: '#000000',
                  borderColor: '#00ff00',
                  color: '#00ff00',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
              <Button
                size={isMobile ? "small" : "middle"}
                icon={<ClearOutlined />}
                onClick={handleClear}
                style={{
                  fontFamily: token.fontFamily,
                  minHeight: isMobile ? '32px' : 'auto',
                  backgroundColor: '#000000',
                  borderColor: '#00ff00',
                  color: '#00ff00',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </>
          )}
          {onSave && fileId && (
            <Button
              type="primary"
              size={isMobile ? "small" : "middle"}
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!isModified}
              style={{
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                minHeight: isMobile ? '32px' : 'auto',
                backgroundColor: '#000000',
                borderColor: '#00ff00',
                color: '#00ff00',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              {isMobile ? 'SAVE' : 'SAVE'}
            </Button>
          )}
        </Space>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div style={{
          padding: isMobile ? token.paddingXS : token.paddingSM,
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgElevated,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '4px' : token.marginXS,
          flexWrap: 'wrap'
        }}>
          {toolbarItems.map(item => (
            <Tooltip key={item.key} title={item.tooltip}>
              <Button
                size={isMobile ? "small" : "middle"}
                type="text"
                icon={item.icon}
                onClick={() => formatText(item.format)}
                style={{
                  fontFamily: token.fontFamily,
                  minWidth: isMobile ? '32px' : 'auto',
                  minHeight: isMobile ? '32px' : 'auto',
                  padding: isMobile ? '4px' : undefined
                }}
              />
            </Tooltip>
          ))}
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1, padding: isMobile ? token.paddingSM : token.paddingMD }}>
        <TextArea
          ref={textareaRef}
          value={state.content}
          onChange={handleContentChange}
          onSelect={updateSelection}
          placeholder={placeholder}
          readOnly={readOnly}
          autoSize={{ minRows: 10, maxRows: 50 }}
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: 1.5,
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            resize: 'none',
            height: '100%',
            minHeight: isMobile ? '300px' : '400px'
          }}
        />
      </div>

      {/* Status Bar */}
      <div style={{
        padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingSM}px ${token.paddingMD}px`,
        borderTop: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: isMobile ? '11px' : '12px',
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily
      }}>
        <div>
          {isModified && <span style={{ color: token.colorWarning }}>● Modified</span>}
          {!isModified && <span>Saved</span>}
        </div>
        <div>
          {state.content.length} characters
        </div>
      </div>
    </div>
  );
};

export default Editor;