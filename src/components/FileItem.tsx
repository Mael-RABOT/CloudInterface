import React from 'react';
import { Button, Checkbox, Typography } from 'antd';
import { theme } from 'antd';
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileOutlined,
  CodeOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  FileMarkdownOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
  CheckCircleFilled,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Item } from '../services/api';

const { Text } = Typography;

interface FileItemProps {
  file: Item;
  onPreview: (file: Item) => void;
  onDownload: (file: Item) => void;
  onDelete: (file: Item) => void;
  onShare: (file: Item) => void;
  selected: boolean;
  onSelect: (fileId: number, selected: boolean) => void;
  isMobile?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onPreview,
  onDownload,
  onDelete,
  onShare,
  selected,
  onSelect,
  isMobile = false
}) => {
  const { token } = theme.useToken();

  const getFileIcon = (contentType: string, filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (contentType.includes('image')) return <FileImageOutlined />;
    if (contentType.includes('pdf')) return <FilePdfOutlined />;
    if (contentType.includes('text')) return <FileTextOutlined />;
    if (extension === 'zip' || extension === 'rar' || extension === '7z') return <FileZipOutlined />;
    if (extension === 'doc' || extension === 'docx') return <FileWordOutlined />;
    if (extension === 'xls' || extension === 'xlsx') return <FileExcelOutlined />;
    if (extension === 'ppt' || extension === 'pptx') return <FilePptOutlined />;
    if (extension === 'mp4' || extension === 'avi' || extension === 'mov') return <VideoCameraOutlined />;
    if (extension === 'mp3' || extension === 'wav' || extension === 'flac') return <SoundOutlined />;
    if (extension === 'exe' || extension === 'msi') return <FileOutlined />;
    if (extension === 'js' || extension === 'ts' || extension === 'py' || extension === 'java') return <CodeOutlined />;
    if (extension === 'html' || extension === 'css' || extension === 'xml') return <CodeOutlined />;
    if (extension === 'json' || extension === 'yaml' || extension === 'yml') return <CodeOutlined />;
    if (extension === 'md') return <FileMarkdownOutlined />;
    if (extension === 'txt') return <FileTextOutlined />;
    if (extension === 'log') return <FileTextOutlined />;
    if (extension === 'bak' || extension === 'tmp') return <FileOutlined />;
    return <FileUnknownOutlined />;
  };

  const formatFilename = (filename: string) => {
    const lastDashIndex = filename.lastIndexOf('-');
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDashIndex !== -1 && lastDotIndex > lastDashIndex) {
      const name = filename.substring(0, lastDashIndex);
      const extension = filename.substring(lastDotIndex);
      return name + extension;
    }

    return filename;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isMobile) {
    return (
      <div
        className="file-item-mobile"
        onClick={() => onPreview(file)}
        style={{
          background: selected ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 255, 0, 0.05)',
          border: `1px solid ${selected ? '#00ff00' : 'rgba(0, 255, 0, 0.3)'}`,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Checkbox
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(file.id, e.target.checked);
          }}
          style={{
            transform: 'scale(1.2)',
            filter: 'brightness(1.2) contrast(1.2)'
          }}
          className="custom-checkbox"
        />

        <div className="file-icon" style={{ fontSize: '24px', color: '#00ff00' }}>
          {getFileIcon(file.contentType, file.filename)}
        </div>

        <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="file-name" style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#00ff00',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {formatFilename(file.filename)}
          </div>
          <div className="file-meta" style={{
            fontSize: '12px',
            color: 'rgba(0, 255, 0, 0.7)'
          }}>
            {formatFileSize(file.size || 0)} • {file.contentType}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="small"
            type="text"
            icon={<DownloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            style={{
              color: '#00ff00',
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: '6px',
              minWidth: '32px',
              height: '32px'
            }}
          />
          <Button
            size="small"
            type="text"
            icon={file.isShared ? <CheckCircleFilled /> : <ShareAltOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onShare(file);
            }}
            style={{
              color: '#00ff00',
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: '6px',
              minWidth: '32px',
              height: '32px'
            }}
          />
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: '6px',
              minWidth: '32px',
              height: '32px'
            }}
          />
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        padding: `${token.paddingSM}px ${token.paddingMD}px`,
        marginBottom: token.marginSM,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: token.fontFamily
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = token.colorPrimary;
        e.currentTarget.style.background = token.colorBgElevated;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = token.colorBorder;
        e.currentTarget.style.background = token.colorBgContainer;
      }}
    >
      {/* Checkbox for bulk selection */}
      <Checkbox
        checked={selected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(file.id, e.target.checked);
        }}
        style={{
          marginRight: token.marginSM,
          transform: 'scale(1.2)',
          filter: 'brightness(1.2) contrast(1.2)'
        }}
        className="custom-checkbox"
      />

      {/* File Icon and Name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: 0
      }}>
        <span style={{
          fontSize: '20px',
          marginRight: token.marginSM
        }}>
          {getFileIcon(file.contentType, file.filename)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{
            color: token.colorText,
            fontSize: token.fontSizeSM,
            fontWeight: 'bold',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {formatFilename(file.filename)}
          </Text>
        </div>
      </div>

      {/* File Type and Location */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: token.marginLG,
        marginRight: token.marginLG
      }}>
        <div style={{
          padding: `2px ${token.paddingSM}px`,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusSM,
          fontSize: token.fontSizeSM,
          color: token.colorPrimary,
          fontFamily: token.fontFamily
        }}>
          {file.contentType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
        </div>
        <div style={{
          fontSize: token.fontSizeSM,
          color: token.colorInfo,
          fontFamily: token.fontFamily
        }}>
          {file.location || 'Root'}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: token.marginXS
      }}>
        <Button
          size="small"
          type="text"
          icon={file.contentType.startsWith('text/') || file.filename.endsWith('.txt') || file.filename.endsWith('.json') || file.filename.endsWith('.xml') || file.filename.endsWith('.md') ? <EditOutlined /> : <FileTextOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(file);
          }}
          style={{
            color: token.colorPrimary,
            fontFamily: token.fontFamily,
            fontSize: token.fontSizeSM,
            background: token.colorBgContainer,
            padding: '2px 6px'
          }}
        />
        <Button
          size="small"
          type="text"
          icon={<DownloadOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file);
          }}
          style={{
            color: token.colorInfo,
            fontFamily: token.fontFamily,
            fontSize: token.fontSizeSM,
            background: token.colorBgContainer,
            padding: '2px 6px'
          }}
        />
        <Button
          size="small"
          type="text"
          icon={file.isShared ? <CheckCircleFilled /> : <ShareAltOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onShare(file);
          }}
          style={{
            color: token.colorSuccess,
            fontFamily: token.fontFamily,
            fontSize: token.fontSizeSM,
            background: token.colorBgContainer,
            padding: '2px 6px'
          }}
        />
        <Button
          size="small"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file);
          }}
          style={{
            fontFamily: token.fontFamily,
            fontSize: token.fontSizeSM,
            padding: '2px 6px',
            background: token.colorBgContainer,
          }}
        />
      </div>
    </div>
  );
};

export default FileItem;