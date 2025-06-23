import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, theme, Tooltip, Space, Divider, Typography } from 'antd';
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
  FileTextOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text: TypographyText } = Typography;

interface EditorProps {
  initialContent?: string;
  title?: string;
  onSave?: (content: string, title: string) => void;
  onClose?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
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
  initialContent = '',
  title: initialTitle = 'Untitled Document',
  onSave,
  onClose,
  readOnly = false,
  placeholder = 'Start typing your document...',
  autoFocus = true
}) => {
  const { token } = theme.useToken();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    title: initialTitle,
    selectionStart: 0,
    selectionEnd: 0,
    history: [initialContent],
    historyIndex: 0
  });

  const [isModified, setIsModified] = useState(false);

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
    if (onSave) {
      onSave(state.content, state.title);
      setIsModified(false);
    } else {
      console.warn('No onSave handler provided');
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
  }, [state]);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Update content when initialContent changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      content: initialContent,
      history: [initialContent],
      historyIndex: 0
    }));
    setIsModified(false);
  }, [initialContent]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div style={{
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      overflow: 'hidden',
      fontFamily: token.fontFamily,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: `${token.paddingMD}px ${token.paddingLG}px`,
        borderBottom: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1, marginRight: token.marginMD }}>
          <Input
            value={state.title}
            onChange={handleTitleChange}
            placeholder="Document title..."
            style={{
              fontFamily: token.fontFamily,
              fontSize: token.fontSizeLG,
              fontWeight: 'bold',
              border: 'none',
              background: 'transparent',
              padding: 0,
              color: token.colorText
            }}
            disabled={readOnly}
          />
        </div>

        <Space>
          {isModified && (
            <TypographyText style={{
              color: token.colorWarning,
              fontSize: token.fontSizeSM,
              fontFamily: token.fontFamily
            }}>
              MODIFIED
            </TypographyText>
          )}

          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={undo}
            disabled={!canUndo || readOnly}
            style={{
              fontFamily: token.fontFamily,
              fontSize: token.fontSizeSM,
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText
            }}
          >
            UNDO
          </Button>

          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={redo}
            disabled={!canRedo || readOnly}
            style={{
              fontFamily: token.fontFamily,
              fontSize: token.fontSizeSM,
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText
            }}
          >
            REDO
          </Button>

          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={readOnly}
            style={{
              fontFamily: token.fontFamily,
              fontSize: token.fontSizeSM,
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText
            }}
          >
            CLEAR
          </Button>

          {onSave && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={readOnly}
              style={{
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                fontSize: token.fontSizeSM,
                background: token.colorPrimary,
                borderColor: token.colorPrimary
              }}
            >
              SAVE
            </Button>
          )}

          {onClose && (
            <Button
              size="small"
              onClick={onClose}
              style={{
                fontFamily: token.fontFamily,
                fontSize: token.fontSizeSM,
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText
              }}
            >
              CLOSE
            </Button>
          )}
        </Space>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div style={{
          padding: `${token.paddingSM}px ${token.paddingLG}px`,
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgElevated,
          display: 'flex',
          alignItems: 'center',
          gap: token.marginXS,
          flexWrap: 'wrap'
        }}>
          <Space size="small">
            <Tooltip title="Bold (Ctrl+B)">
              <Button
                size="small"
                icon={<BoldOutlined />}
                onClick={() => formatText('bold')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Italic (Ctrl+I)">
              <Button
                size="small"
                icon={<ItalicOutlined />}
                onClick={() => formatText('italic')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Underline (Ctrl+U)">
              <Button
                size="small"
                icon={<UnderlineOutlined />}
                onClick={() => formatText('underline')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Strikethrough">
              <Button
                size="small"
                icon={<StrikethroughOutlined />}
                onClick={() => formatText('strikethrough')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Code">
              <Button
                size="small"
                icon={<CodeOutlined />}
                onClick={() => formatText('code')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Highlight">
              <Button
                size="small"
                icon={<HighlightOutlined />}
                onClick={() => formatText('highlight')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>
          </Space>

          <Divider type="vertical" style={{ margin: '0 8px' }} />

          <Space size="small">
            <Tooltip title="Heading 1">
              <Button
                size="small"
                onClick={() => formatText('heading1')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  fontWeight: 'bold',
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              >
                H1
              </Button>
            </Tooltip>

            <Tooltip title="Heading 2">
              <Button
                size="small"
                onClick={() => formatText('heading2')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  fontWeight: 'bold',
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              >
                H2
              </Button>
            </Tooltip>

            <Tooltip title="Heading 3">
              <Button
                size="small"
                onClick={() => formatText('heading3')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  fontWeight: 'bold',
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              >
                H3
              </Button>
            </Tooltip>

            <Tooltip title="Quote">
              <Button
                size="small"
                onClick={() => formatText('quote')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              >
                QUOTE
              </Button>
            </Tooltip>
          </Space>

          <Divider type="vertical" style={{ margin: '0 8px' }} />

          <Space size="small">
            <Tooltip title="Ordered List">
              <Button
                size="small"
                icon={<OrderedListOutlined />}
                onClick={() => formatText('list-ordered')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Unordered List">
              <Button
                size="small"
                icon={<UnorderedListOutlined />}
                onClick={() => formatText('list-unordered')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>

            <Tooltip title="Link">
              <Button
                size="small"
                icon={<LinkOutlined />}
                onClick={() => formatText('link')}
                style={{
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  color: token.colorText
                }}
              />
            </Tooltip>
          </Space>
        </div>
      )}

      {/* Editor Area */}
      <div style={{ flex: 1, padding: token.paddingLG }}>
        <TextArea
          ref={textareaRef}
          value={state.content}
          onChange={handleContentChange}
          onSelect={updateSelection}
          placeholder={placeholder}
          readOnly={readOnly}
          autoSize={{ minRows: 20, maxRows: 50 }}
          style={{
            fontFamily: 'monospace',
            fontSize: token.fontSizeSM,
            lineHeight: 1.6,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
            color: token.colorText,
            resize: 'none',
            height: '100%',
            minHeight: '400px'
          }}
        />
      </div>

      {/* Status Bar */}
      <div style={{
        padding: `${token.paddingSM}px ${token.paddingLG}px`,
        borderTop: `1px solid ${token.colorBorder}`,
        background: token.colorBgElevated,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily
      }}>
        <div>
          <FileTextOutlined style={{ marginRight: token.marginXS }} />
          {state.content.length} characters
          {state.content.split('\n').length > 1 && (
            <span style={{ marginLeft: token.marginMD }}>
              {state.content.split('\n').length} lines
            </span>
          )}
        </div>

        <div>
          {state.selectionStart !== state.selectionEnd && (
            <span style={{ marginRight: token.marginMD }}>
              Selected: {state.selectionEnd - state.selectionStart} characters
            </span>
          )}
          <span>
            Ctrl+S: Save | Ctrl+Z: Undo | Ctrl+Shift+Z: Redo
          </span>
        </div>
      </div>
    </div>
  );
};

export default Editor;