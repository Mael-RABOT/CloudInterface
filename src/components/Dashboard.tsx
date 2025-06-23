import React, { useState, useEffect } from 'react';
import { Layout, Typography, theme, Button, Tree, message, Modal, Upload, Progress, Form, Input, Tooltip, Checkbox, Drawer } from 'antd';
import {
  FileTextOutlined,
  LogoutOutlined,
  FolderOutlined,
  HomeOutlined,
  UploadOutlined,
  InboxOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileOutlined,
  CodeOutlined,
  SettingOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  FileMarkdownOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import type { Item } from '../services/api';
import type { Key } from 'antd/es/table/interface';
import FilePreview from './FilePreview';
import { useDeviceDetection } from '../utils/deviceDetection';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

// Mobile File Item Component
interface MobileFileItemProps {
  file: Item;
  onPreview: (file: Item) => void;
  onDownload: (file: Item) => void;
  onDelete: (file: Item) => void;
  selected: boolean;
  onSelect: (fileId: number, selected: boolean) => void;
}

const MobileFileItem: React.FC<MobileFileItemProps> = ({
  file,
  onPreview,
  onDownload,
  onDelete,
  selected,
  onSelect
}) => {
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
    if (extension === 'exe' || extension === 'msi') return <SettingOutlined />;
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
          icon={<InboxOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file);
          }}
          style={{
            color: '#00ff00',
            background: 'rgba(0, 255, 0, 0.1)',
            border: '1px solid rgba(0, 255, 0, 0.3)',
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
            background: 'rgba(255, 77, 79, 0.1)',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: '6px',
            minWidth: '32px',
            height: '32px'
          }}
        />
      </div>
    </div>
  );
};

// Custom File Display Component
interface FileGridProps {
  files: Item[];
  onPreview: (file: Item) => void;
  onDownload: (file: Item) => void;
  onDelete: (file: Item) => void;
  loading?: boolean;
  selectedFileIds: Set<number>;
  onFileSelect: (fileId: number, selected: boolean) => void;
}

const FileGrid: React.FC<FileGridProps> = ({ files, onPreview, onDownload, onDelete, loading, selectedFileIds, onFileSelect }) => {
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
    if (extension === 'exe' || extension === 'msi') return <SettingOutlined />;
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
    // Remove the ID part from filename (format: name-id.extension -> name.extension)
    const lastDashIndex = filename.lastIndexOf('-');
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDashIndex !== -1 && lastDotIndex > lastDashIndex) {
      const name = filename.substring(0, lastDashIndex);
      const extension = filename.substring(lastDotIndex);
      return name + extension;
    }

    return filename;
  };

  if (loading) {
    return (
      <div style={{
        padding: token.paddingXL,
        textAlign: 'center',
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily
      }}>
        <Text>LOADING FILES...</Text>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        padding: token.paddingXL,
        textAlign: 'center',
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily
      }}>
        <Text>NO FILES FOUND IN THIS LOCATION</Text>
        <br />
        <Text style={{ fontSize: token.fontSizeSM }}>UPLOAD FILES TO GET STARTED</Text>
      </div>
    );
  }

  return (
    <div style={{
      padding: token.paddingMD,
      maxHeight: 'calc(100vh - 300px)',
      overflowY: 'auto'
    }}>
      {files.map((file) => (
        <div
          key={file.id}
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
            checked={selectedFileIds.has(file.id)}
            onChange={(e) => {
              e.stopPropagation();
              onFileSelect(file.id, e.target.checked);
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
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
              style={{
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                fontSize: token.fontSizeSM,
                padding: '2px 6px'
              }}
            >
              VIEW
            </Button>
            <Button
              size="small"
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(file);
              }}
              style={{
                color: token.colorInfo,
                fontFamily: token.fontFamily,
                fontSize: token.fontSizeSM,
                padding: '2px 6px'
              }}
            >
              DOWNLOAD
            </Button>
            <Button
              size="small"
              type="text"
              danger
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
              style={{
                fontFamily: token.fontFamily,
                fontSize: token.fontSizeSM,
                padding: '2px 6px'
              }}
            >
              DELETE
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Custom Tree Component with Tooltips
const CustomTree: React.FC<{ treeData: any[]; onSelect: (selectedKeys: Key[]) => void }> = ({ treeData, onSelect }) => {
  const { token } = theme.useToken();

  const renderTreeNode = (node: any) => {
    const title = node.fullTitle ? (
      <Tooltip title={node.fullTitle} placement="right">
        <span style={{
          display: 'block',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {node.title}
        </span>
      </Tooltip>
    ) : node.title;

    return {
      ...node,
      title,
      children: node.children ? node.children.map(renderTreeNode) : undefined
    };
  };

  const processedTreeData = treeData.map(renderTreeNode);

  // Get all keys for expanded state
  const getAllKeys = (nodes: any[]): string[] => {
    const keys: string[] = [];
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key);
        keys.push(...getAllKeys(node.children));
      }
    });
    return keys;
  };

  const expandedKeys = getAllKeys(processedTreeData);

  return (
    <Tree
      treeData={processedTreeData}
      onSelect={onSelect}
      showIcon
      showLine={{ showLeafIcon: false }}
      expandedKeys={expandedKeys}
      style={{
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        background: 'transparent'
      }}
      className="custom-tree"
    />
  );
};

const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const { logout, user } = useAuth();
  const { isMobile, isSmallMobile } = useDeviceDetection();
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [files, setFiles] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [folderTree, setFolderTree] = useState<any[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState('');
  const [uploadForm] = Form.useForm();

  // Mobile navigation state
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Bulk delete state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalVisible, setBulkDeleteModalVisible] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const [currentDeletingFile, setCurrentDeletingFile] = useState('');

  // Preview state variables
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState('');
  const [textPreviewVisible, setTextPreviewVisible] = useState(false);
  const [textPreviewContent, setTextPreviewContent] = useState('');
  const [textPreviewTitle, setTextPreviewTitle] = useState('');
  const [textPreviewFileId, setTextPreviewFileId] = useState<number | undefined>();
  const [unsupportedFileModalVisible, setUnsupportedFileModalVisible] = useState(false);
  const [unsupportedFileItem, setUnsupportedFileItem] = useState<Item | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

// ASCII Art Header
const ASCII_HEADER = isMobile ? '' : `
   ╔═══════════════════════════════════════════════════╗             ██████╗██╗      ██████╗ ██╗   ██╗██████╗              ╔══════════════════════╗
   ║          INTERFACE v2.0 - TERMINAL ACCESS         ║            ██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗             ║     SYSTEM INFO      ║
   ║              SECURE FILE MANAGEMENT               ║  ╔══════╗  ██║     ██║     ██║   ██║██║   ██║██║  ██║  ╔══════╗   ║                      ║
   ║                                                   ║  ╚══════╝  ██║     ██║     ██║   ██║██║   ██║██║  ██║  ╚══════╝   ║    STATUS: ONLINE    ║
   ║              [SYSTEM ONLINE] [SECURE]             ║            ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝             ║   SECURITY: ACTIVE   ║
   ╚═══════════════════════════════════════════════════╝             ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝              ╚══════════════════════╝
`;

  // Helper function to get original filename
  const getOriginalFilename = (filename: string) => {
    const lastDashIndex = filename.lastIndexOf('-');
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDashIndex !== -1 && lastDotIndex > lastDashIndex) {
      const name = filename.substring(0, lastDashIndex);
      const extension = filename.substring(lastDotIndex);
      return name + extension;
    }

    return filename;
  };

  // Load files from API
  const loadFiles = async () => {
    try {
      setLoading(true);
      const items = await itemsAPI.getMyItems();
      setFiles(items);

      // Build folder tree from actual file locations
      const locations = new Set<string>();
      items.forEach(item => {
        if (item.location) {
          locations.add(item.location);
        }
      });

      const treeData = [
        {
          title: 'ROOT',
          key: '',
          icon: <HomeOutlined style={{ color: '#00ff88' }} />,
          children: Array.from(locations).sort().map(location => ({
            title: location.length > 20 ? location.substring(0, 17) + '...' : location,
            key: location,
            icon: <FolderOutlined style={{ color: '#ffaa00' }} />,
            fullTitle: location // Store full title for tooltip
          }))
        }
      ];

      setFolderTree(treeData);
    } catch (error) {
      console.error('Failed to load files:', error);
      message.error('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFolderSelect = (selectedKeys: Key[]) => {
    if (selectedKeys.length > 0) {
      setCurrentLocation(selectedKeys[0] as string);
    }
  };

  const handlePreview = async (file: Item) => {
    setPreviewLoading(true);

    // Immediately open the appropriate modal based on file type
    if (file.contentType.startsWith('image/')) {
      setPreviewTitle(getOriginalFilename(file.filename));
      setPreviewVisible(true);
    } else if (file.contentType === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf')) {
      setPdfPreviewTitle(getOriginalFilename(file.filename));
      setPdfPreviewVisible(true);
    } else if (file.contentType.startsWith('text/') ||
               file.contentType === 'application/json' ||
               file.contentType === 'application/xml' ||
               file.filename.endsWith('.txt') ||
               file.filename.endsWith('.json') ||
               file.filename.endsWith('.xml') ||
               file.filename.endsWith('.md')) {
      setTextPreviewTitle(getOriginalFilename(file.filename));
      setTextPreviewFileId(file.id);
      setTextPreviewVisible(true);
    } else {
      console.log("unsupported file type", file.contentType);
      message.warning(`Cannot preview ${getOriginalFilename(file.filename)}. This file type (${file.contentType}) cannot be previewed.`);
      setUnsupportedFileItem(file);
      setUnsupportedFileModalVisible(true);
      return; // Don't load content for unsupported files
    }

    try {
      const blob = await itemsAPI.downloadFile(file.id);

      if (file.contentType.startsWith('image/')) {
        const url = window.URL.createObjectURL(blob);
        setPreviewImage(url);
      } else if (file.contentType === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf')) {
        const url = window.URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
      } else if (file.contentType.startsWith('text/') ||
                 file.contentType === 'application/json' ||
                 file.contentType === 'application/xml' ||
                 file.filename.endsWith('.txt') ||
                 file.filename.endsWith('.json') ||
                 file.filename.endsWith('.xml') ||
                 file.filename.endsWith('.md')) {
        const text = await blob.text();
        setTextPreviewContent(text);
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      message.error(`Failed to preview ${file.filename}: ${error.message || 'Unknown error'}`);
      // Close the modal on error
      setPreviewVisible(false);
      setPdfPreviewVisible(false);
      setTextPreviewVisible(false);
      setPreviewImage('');
      setPdfPreviewUrl('');
      setTextPreviewContent('');
      setPreviewTitle('');
      setPdfPreviewTitle('');
      setTextPreviewTitle('');
      setTextPreviewFileId(undefined);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileUpdate = async (fileId: number, content: string, filename: string) => {
    try {
      await itemsAPI.updateFile(fileId, content, filename);
      message.success('File updated successfully!');
      // Reload files to reflect changes
      loadFiles();
    } catch (error: any) {
      console.error('File update error:', error);
      message.error(`Failed to update file: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDownload = async (file: Item) => {
    try {
      const blob = await itemsAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getOriginalFilename(file.filename);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success(`Downloaded: ${getOriginalFilename(file.filename)}`);
    } catch (error) {
      console.error('Download failed:', error);
      message.error(`Failed to download ${getOriginalFilename(file.filename)}`);
    }
  };

  const handleDelete = async (file: Item) => {
    try {
      await itemsAPI.deleteItem(file.id);
      setFiles(files.filter(f => f.id !== file.id));
      message.success(`Deleted: ${file.filename}`);
    } catch (error) {
      console.error('Delete failed:', error);
      message.error(`Failed to delete ${file.filename}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Upload handlers
  const handleUploadModalOpen = () => {
    setUploadModalVisible(true);
    setSelectedFiles([]);
    setUploadProgress(0);
    setCurrentUploadFile('');
    uploadForm.resetFields();
    uploadForm.setFieldsValue({ location: currentLocation });
  };

  const handleUploadModalClose = () => {
    setUploadModalVisible(false);
    setSelectedFiles([]);
    setUploadProgress(0);
    setCurrentUploadFile('');
    setUploadLoading(false);
    uploadForm.resetFields();
  };

  const handleUpload = async (values: any) => {
    if (selectedFiles.length === 0) {
      message.error('Please select files');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;
      const results: any[] = [];

      for (const file of selectedFiles) {
        try {
          // Update progress for current file
          const fileProgress = (completedFiles / totalFiles) * 100;
          setUploadProgress(Math.round(fileProgress));
          setCurrentUploadFile(file.name);

          // Upload single file
          const result = await itemsAPI.uploadFile(values.location, file);
          results.push(result);
          completedFiles++;

          // Show progress for each file
          message.success(`Uploaded: ${getOriginalFilename(file.name)}`);

        } catch (error: any) {
          console.error(`Upload error for ${file.name}:`, error);
          message.error(`Failed to upload ${getOriginalFilename(file.name)}: ${error.message || 'Unknown error'}`);
          // Continue with next file even if one fails
        }
      }

      setUploadProgress(100);

      setTimeout(() => {
        const successCount = results.length;
        const failedCount = totalFiles - successCount;

        if (failedCount === 0) {
          message.success(`All ${totalFiles} files uploaded successfully!`);
        } else {
          message.warning(`${successCount} files uploaded, ${failedCount} failed`);
        }

        handleUploadModalClose();
        loadFiles();
      }, 500);

    } catch (error: any) {
      setUploadProgress(0);
      setCurrentUploadFile('');
      console.error('Upload error:', error);
      message.error('Upload failed: Please try again');
    } finally {
      setUploadLoading(false);
    }
  };

  // Filter files by current location
  const filteredFiles = currentLocation
    ? files.filter(file => file.location === currentLocation)
    : files;

  // Bulk delete handlers
  const handleFileSelect = (fileId: number, selected: boolean) => {
    const newSelectedIds = new Set(selectedFileIds);
    if (selected) {
      newSelectedIds.add(fileId);
    } else {
      newSelectedIds.delete(fileId);
    }
    setSelectedFileIds(newSelectedIds);
  };

  const handleBulkDelete = async () => {
    if (selectedFileIds.size === 0) {
      message.warning('Please select files to delete');
      return;
    }

    setBulkDeleteModalVisible(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true);
      setBulkDeleteProgress(0);
      setCurrentDeletingFile('');

      const fileIdsArray = Array.from(selectedFileIds);
      const totalFiles = fileIdsArray.length;
      let deletedCount = 0;

      for (let i = 0; i < fileIdsArray.length; i++) {
        const fileId = fileIdsArray[i];
        const file = files.find(f => f.id === fileId);

        try {
          // Update progress
          const progress = Math.round(((i + 1) / totalFiles) * 100);
          setBulkDeleteProgress(progress);
          setCurrentDeletingFile(file ? getOriginalFilename(file.filename) : `File ${fileId}`);

          await itemsAPI.deleteItem(fileId);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete file ${fileId}:`, error);
        }
      }

      // Update the files state
      setFiles(prev => prev.filter(file => !selectedFileIds.has(file.id)));

      // Clear selection
      setSelectedFileIds(new Set());

      if (deletedCount === totalFiles) {
        message.success(`Successfully deleted ${deletedCount} files`);
      } else {
        message.warning(`Deleted ${deletedCount} out of ${totalFiles} files`);
      }

      setBulkDeleteModalVisible(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      message.error('Failed to delete some files. Please try again.');
    } finally {
      setBulkDeleteLoading(false);
      setBulkDeleteProgress(0);
      setCurrentDeletingFile('');
    }
  };

  const handleSelectAll = () => {
    const allFileIds = new Set(filteredFiles.map(file => file.id));
    setSelectedFileIds(allFileIds);
  };

  const handleClearSelection = () => {
    setSelectedFileIds(new Set());
  };

  // Mobile navigation handlers
  const handleMobileDrawerOpen = () => {
    setMobileDrawerVisible(true);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerVisible(false);
  };

  const handleMobileFolderSelect = (selectedKeys: Key[]) => {
    if (selectedKeys.length > 0) {
      setCurrentLocation(selectedKeys[0] as string);
      setMobileDrawerVisible(false); // Close drawer after selection
    }
  };

  return (
    <Layout style={{
      minHeight: '100vh',
      background: '#000',
      position: 'relative'
    }}>
      {/* Header */}
      <Header style={{
        background: '#000',
        borderBottom: `2px solid ${token.colorPrimary}`,
        padding: isMobile ? `0 ${token.paddingMD}px` : `0 ${token.paddingXL}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'auto',
        minHeight: isMobile ? '80px' : '120px'
      }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleMobileDrawerOpen}
            style={{
              color: '#00ff00',
              background: 'rgba(0, 255, 0, 0.1)',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px'
            }}
          />
        )}

        <div style={{ flex: 1 }}>
          <pre style={{
            fontFamily: token.fontFamily,
            fontSize: isSmallMobile ? '6px' : isMobile ? '8px' : '10px',
            lineHeight: 1.2,
            color: token.colorPrimary,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {ASCII_HEADER}
          </pre>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? token.marginSM : token.marginMD,
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          <div style={{
            padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingSM}px ${token.paddingMD}px`,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            color: token.colorTextSecondary,
            fontSize: isMobile ? '12px' : '14px'
          }}>
            USER: {user?.username || 'UNKNOWN'}
          </div>

          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              color: token.colorError,
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              outlineColor: token.colorError,
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingSM}px ${token.paddingMD}px`,
              border: `1px solid ${token.colorBorder}`,
              fontSize: isMobile ? '12px' : token.fontSizeSM,
              minHeight: isMobile ? '36px' : 'auto'
            }}
          >
            {isMobile ? 'LOGOUT' : 'LOGOUT'}
          </Button>
        </div>
      </Header>

      <Layout style={{ position: 'relative' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            width={250}
            style={{
              background: '#001100',
              borderRight: `2px solid ${token.colorBorder}`,
              position: 'relative'
            }}
            theme="dark"
          >
            <div style={{
              padding: token.paddingLG,
              borderBottom: `1px solid ${token.colorBorder}`,
              background: token.colorBgContainer
            }}>
              <Title level={4} style={{
                margin: 0,
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                LOCATIONS
              </Title>
            </div>

            <div style={{
              padding: token.paddingMD,
              height: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}>
              <CustomTree treeData={folderTree} onSelect={handleFolderSelect} />
            </div>
          </Sider>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            title={
              <Title level={4} style={{
                margin: 0,
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                fontWeight: 'bold'
              }}>
                LOCATIONS
              </Title>
            }
            placement="left"
            onClose={handleMobileDrawerClose}
            open={mobileDrawerVisible}
            width={280}
            styles={{
              body: {
                padding: 0,
                background: '#001100'
              },
              header: {
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorder}`
              }
            }}
          >
            <div style={{
              padding: token.paddingMD,
              height: 'calc(100vh - 120px)',
              overflowY: 'auto'
            }}>
              <CustomTree treeData={folderTree} onSelect={handleMobileFolderSelect} />
            </div>
          </Drawer>
        )}

        {/* Main Content */}
        <Content style={{
          background: '#000',
          padding: isMobile ? token.paddingSM : token.paddingLG,
          position: 'relative',
          marginLeft: isMobile ? 0 : undefined
        }}>
          <div style={{
            background: token.colorBgElevated,
            border: `2px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 200px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Files Section - Hidden on Mobile */}
            {!isMobile && (
            <div style={{
              padding: isMobile ? `${token.paddingMD}px ${token.paddingLG}px` : `${token.paddingLG}px ${token.paddingXL}px`,
              borderBottom: `1px solid ${token.colorBorder}`,
              background: token.colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: isMobile ? token.marginSM : 0
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Title level={isMobile ? 5 : 4} style={{
                  margin: 0,
                  color: token.colorPrimary,
                  fontFamily: token.fontFamily,
                  fontWeight: 'bold',
                  fontSize: isMobile ? '16px' : undefined
                }}>
                  <FileTextOutlined style={{ marginRight: token.marginSM }} />
                  FILES: {currentLocation || 'ROOT'}
                </Title>
                <Text style={{
                  color: token.colorTextSecondary,
                  fontFamily: token.fontFamily,
                  fontSize: isMobile ? '12px' : token.fontSizeSM,
                  display: 'block',
                  marginTop: token.marginXS
                }}>
                  {filteredFiles.length} files found
                  {selectedFileIds.size > 0 && (
                    <span style={{ color: token.colorPrimary, fontWeight: 'bold' }}>
                      {' '}({selectedFileIds.size} selected)
                    </span>
                  )}
                </Text>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? token.marginSM : token.marginMD,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                {/* Bulk Delete Button */}
                {selectedFileIds.size > 0 && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                    size={isMobile ? "small" : "middle"}
                    style={{
                      fontFamily: token.fontFamily,
                      fontWeight: 'bold',
                      background: token.colorError,
                      borderColor: token.colorError,
                      color: '#fff',
                      boxShadow: '0 2px 4px rgba(255, 77, 79, 0.3)',
                      minHeight: isMobile ? '36px' : 'auto'
                    }}
                  >
                    {isMobile ? `DEL (${selectedFileIds.size})` : `DELETE (${selectedFileIds.size})`}
                  </Button>
                )}

                {/* Selection Controls */}
                {filteredFiles.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: token.marginSM,
                    padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingSM}px ${token.paddingMD}px`,
                    background: token.colorBgElevated,
                    border: `1px solid ${token.colorBorder}`,
                    borderRadius: token.borderRadius
                  }}>
                    <Button
                      size={isMobile ? "small" : "small"}
                      type="text"
                      onClick={handleSelectAll}
                      style={{
                        fontFamily: token.fontFamily,
                        fontSize: isMobile ? '11px' : token.fontSizeSM,
                        color: token.colorPrimary,
                        minHeight: isMobile ? '28px' : 'auto'
                      }}
                    >
                      {isMobile ? 'ALL' : 'SELECT ALL'}
                    </Button>
                    <Button
                      size={isMobile ? "small" : "small"}
                      type="text"
                      onClick={handleClearSelection}
                      style={{
                        fontFamily: token.fontFamily,
                        fontSize: isMobile ? '11px' : token.fontSizeSM,
                        color: token.colorTextSecondary,
                        minHeight: isMobile ? '28px' : 'auto'
                      }}
                    >
                      {isMobile ? 'CLEAR' : 'CLEAR'}
                    </Button>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleUploadModalOpen}
                  size={isMobile ? "small" : "middle"}
                  style={{
                    fontFamily: token.fontFamily,
                    fontWeight: 'bold',
                    background: token.colorPrimary,
                    borderColor: token.colorPrimary,
                    boxShadow: `0 2px 4px ${token.colorPrimary}40`,
                    minHeight: isMobile ? '36px' : 'auto'
                  }}
                >
                  {isMobile ? 'UPLOAD' : 'UPLOAD'}
                </Button>
              </div>
            </div>
            )}

            {/* File Display */}
            <div style={{
              padding: isMobile ? token.paddingSM : token.paddingLG,
              height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 280px)',
              overflowY: 'auto'
            }}>
              {loading ? (
                <div style={{
                  padding: token.paddingXL,
                  textAlign: 'center',
                  color: token.colorTextSecondary,
                  fontFamily: token.fontFamily
                }}>
                  <Text>LOADING FILES...</Text>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div style={{
                  padding: token.paddingXL,
                  textAlign: 'center',
                  color: token.colorTextSecondary,
                  fontFamily: token.fontFamily
                }}>
                  <Text>NO FILES FOUND IN THIS LOCATION</Text>
                  <br />
                  <Text style={{ fontSize: token.fontSizeSM }}>UPLOAD FILES TO GET STARTED</Text>
                </div>
              ) : isMobile ? (
                // Mobile file grid
                <div className="file-grid-mobile">
                  {filteredFiles.map((file) => (
                    <MobileFileItem
                      key={file.id}
                      file={file}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      selected={selectedFileIds.has(file.id)}
                      onSelect={handleFileSelect}
                    />
                  ))}
                </div>
              ) : (
                // Desktop file grid
                <FileGrid
                  files={filteredFiles}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  loading={loading}
                  selectedFileIds={selectedFileIds}
                  onFileSelect={handleFileSelect}
                />
              )}
            </div>
          </div>
        </Content>
      </Layout>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <div className="mobile-actions">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={handleUploadModalOpen}
            className="mobile-fab"
            size="large"
          />
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
            fontFamily: token.fontFamily,
            color: token.colorPrimary,
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '18px'
          }}>
            <UploadOutlined />
            UPLOAD FILES
          </div>
        }
        open={uploadModalVisible}
        onCancel={handleUploadModalClose}
        footer={null}
        width={isMobile ? '95vw' : 600}
        style={{
          fontFamily: token.fontFamily,
          top: isMobile ? 20 : 100
        }}
        styles={{
          body: {
            padding: isMobile ? '16px' : '24px',
            maxHeight: isMobile ? '70vh' : '80vh',
            overflow: 'auto'
          },
          header: {
            padding: isMobile ? '12px 16px' : '16px 24px'
          }
        }}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{ location: currentLocation }}
        >
          <Form.Item
            name="location"
            label={
              <Text style={{
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                LOCATION
              </Text>
            }
            rules={[{ required: true, message: 'Please enter a location!' }]}
          >
            <Input
              placeholder="e.g., documents, photos, etc."
              size={isMobile ? "large" : "middle"}
              style={{
                fontFamily: token.fontFamily,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorText,
                minHeight: isMobile ? '48px' : 'auto',
                fontSize: isMobile ? '16px' : '14px'
              }}
              prefix={<FolderOutlined style={{ color: token.colorPrimary }} />}
            />
          </Form.Item>

          <Form.Item
            label={
              <Text style={{
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                SELECT FILES
              </Text>
            }
            required
          >
            <Dragger
              beforeUpload={(file) => {
                setSelectedFiles(prev => [...prev, file]);
                return false;
              }}
              showUploadList={false}
              accept="*/*"
              multiple
              disabled={uploadLoading}
              style={{
                padding: isMobile ? '24px 16px' : '32px 24px'
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{
                  fontSize: isMobile ? '36px' : '48px',
                  color: token.colorPrimary
                }} />
              </p>
              <p className="ant-upload-text" style={{
                color: token.colorText,
                fontFamily: token.fontFamily,
                fontSize: isMobile ? '16px' : token.fontSizeLG,
                fontWeight: 'bold',
                margin: isMobile ? '8px 0' : '12px 0'
              }}>
                {isMobile ? 'Tap to select files' : 'Click or drag files to this area to upload'}
              </p>
              <p className="ant-upload-hint" style={{
                color: token.colorTextSecondary,
                fontFamily: token.fontFamily,
                fontSize: isMobile ? '12px' : token.fontSizeSM
              }}>
                {isMobile ? 'Support for multiple file uploads' : 'Support for multiple file uploads. Files will be uploaded to the selected location.'}
              </p>
            </Dragger>

            {selectedFiles.length > 0 && (
              <div style={{
                marginTop: token.marginMD,
                padding: isMobile ? token.paddingSM : token.paddingMD,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorSuccess}`,
                borderRadius: token.borderRadius
              }}>
                <div style={{
                  fontFamily: token.fontFamily,
                  color: token.colorSuccess,
                  fontWeight: 'bold',
                  marginBottom: token.marginSM,
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  SELECTED FILES ({selectedFiles.length}):
                </div>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{
                    fontSize: isMobile ? '12px' : token.fontSizeSM,
                    marginBottom: token.marginXS,
                    padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingXS}px ${token.paddingMD}px`,
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorder}`,
                    borderRadius: token.borderRadiusSM,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: token.fontFamily
                  }}>
                    <span style={{
                      color: token.colorText,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginRight: isMobile ? '8px' : '12px'
                    }}>
                      {getOriginalFilename(file.name)} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <Tooltip title="Remove this file">
                      <Button
                        type="text"
                        size={isMobile ? "small" : "small"}
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        style={{
                          padding: isMobile ? '4px' : '0 4px',
                          minWidth: isMobile ? '32px' : 'auto',
                          minHeight: isMobile ? '32px' : 'auto',
                          fontFamily: token.fontFamily
                        }}
                      />
                    </Tooltip>
                  </div>
                ))}
                <div style={{
                  fontSize: isMobile ? '12px' : token.fontSizeSM,
                  marginTop: token.marginSM,
                  padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingXS}px ${token.paddingMD}px`,
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorInfo}`,
                  borderRadius: token.borderRadiusSM,
                  textAlign: 'center',
                  fontFamily: token.fontFamily,
                  color: token.colorInfo,
                  fontWeight: 'bold'
                }}>
                  TOTAL SIZE: {Math.round(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024)} KB
                </div>
                <Button
                  type="text"
                  size={isMobile ? "small" : "small"}
                  onClick={() => setSelectedFiles([])}
                  style={{
                    marginTop: token.marginSM,
                    fontFamily: token.fontFamily,
                    color: token.colorWarning,
                    minHeight: isMobile ? '32px' : 'auto'
                  }}
                >
                  CLEAR ALL
                </Button>
              </div>
            )}
          </Form.Item>

          {uploadProgress > 0 && (
            <Form.Item
              label={
                <Text style={{
                  color: token.colorPrimary,
                  fontFamily: token.fontFamily,
                  fontWeight: 'bold',
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  UPLOAD PROGRESS
                </Text>
              }
            >
              {currentUploadFile && (
                <div style={{
                  marginBottom: token.marginSM,
                  fontSize: isMobile ? '12px' : token.fontSizeSM,
                  fontFamily: token.fontFamily,
                  color: token.colorTextSecondary
                }}>
                  UPLOADING: {currentUploadFile}
                </div>
              )}
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? 'success' : 'active'}
                strokeColor={token.colorPrimary}
                style={{
                  fontFamily: token.fontFamily
                }}
                format={(percent) => `${percent}% (${Math.round((uploadProgress / 100) * selectedFiles.length)}/${selectedFiles.length} files)`}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploadLoading}
              size={isMobile ? "large" : "middle"}
              style={{
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                width: '100%',
                height: isMobile ? '48px' : '40px',
                fontSize: isMobile ? '16px' : '14px'
              }}
              disabled={selectedFiles.length === 0}
            >
              {uploadLoading ? 'UPLOADING...' : `UPLOAD ${selectedFiles.length} FILE${selectedFiles.length !== 1 ? 'S' : ''}`}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
            fontFamily: token.fontFamily,
            color: token.colorError,
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '18px'
          }}>
            <DeleteOutlined />
            CONFIRM BULK DELETE
          </div>
        }
        open={bulkDeleteModalVisible}
        onCancel={() => setBulkDeleteModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setBulkDeleteModalVisible(false)}
            size={isMobile ? "large" : "middle"}
            style={{
              fontFamily: token.fontFamily,
              minHeight: isMobile ? '48px' : 'auto'
            }}
          >
            CANCEL
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={bulkDeleteLoading}
            onClick={confirmBulkDelete}
            size={isMobile ? "large" : "middle"}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              minHeight: isMobile ? '48px' : 'auto'
            }}
          >
            {bulkDeleteLoading ? 'DELETING...' : `DELETE ${selectedFileIds.size} FILE${selectedFileIds.size !== 1 ? 'S' : ''}`}
          </Button>
        ]}
        width={isMobile ? '90vw' : 500}
        style={{
          fontFamily: token.fontFamily,
          top: isMobile ? 20 : 100
        }}
        styles={{
          body: {
            padding: isMobile ? '16px' : '24px'
          },
          header: {
            padding: isMobile ? '12px 16px' : '16px 24px'
          }
        }}
      >
        <div style={{
          textAlign: 'center',
          color: token.colorTextSecondary,
          fontFamily: token.fontFamily
        }}>
          <div style={{
            fontSize: isMobile ? '48px' : '64px',
            marginBottom: token.marginLG,
            color: token.colorError
          }}>
            <DeleteOutlined />
          </div>
          <Typography.Text style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'bold',
            color: token.colorError,
            display: 'block',
            marginBottom: token.marginMD
          }}>
            WARNING: IRREVERSIBLE ACTION
          </Typography.Text>
          <Typography.Text style={{
            fontSize: isMobile ? '14px' : '16px',
            display: 'block',
            marginBottom: token.marginSM
          }}>
            You are about to permanently delete {selectedFileIds.size} file{selectedFileIds.size !== 1 ? 's' : ''}.
          </Typography.Text>
          <Typography.Text style={{
            fontSize: isMobile ? '12px' : '14px',
            color: token.colorTextTertiary
          }}>
            This action cannot be undone. All selected files will be permanently removed from the system.
          </Typography.Text>
          {bulkDeleteProgress > 0 && (
            <div style={{
              marginTop: token.marginLG,
              padding: token.paddingMD,
              background: token.colorBgElevated,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius
            }}>
              {currentDeletingFile && (
                <div style={{
                  marginBottom: token.marginSM,
                  fontSize: isMobile ? '12px' : token.fontSizeSM,
                  fontFamily: token.fontFamily,
                  color: token.colorTextSecondary
                }}>
                  DELETING: {currentDeletingFile}
                </div>
              )}
              <Progress
                percent={bulkDeleteProgress}
                status={bulkDeleteProgress === 100 ? 'success' : 'active'}
                strokeColor={token.colorError}
                style={{
                  fontFamily: token.fontFamily
                }}
                format={(percent) => `${percent}% (${Math.round((bulkDeleteProgress / 100) * selectedFileIds.size)}/${selectedFileIds.size} files)`}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* File Preview Components */}
      <FilePreview
        previewVisible={previewVisible}
        previewImage={previewImage}
        previewTitle={previewTitle}
        previewLoading={previewLoading}
        pdfPreviewVisible={pdfPreviewVisible}
        pdfPreviewUrl={pdfPreviewUrl}
        pdfPreviewTitle={pdfPreviewTitle}
        textPreviewVisible={textPreviewVisible}
        textPreviewContent={textPreviewContent}
        textPreviewTitle={textPreviewTitle}
        textPreviewFileId={textPreviewFileId}
        unsupportedFileModalVisible={unsupportedFileModalVisible}
        unsupportedFileItem={unsupportedFileItem}
        onCloseImagePreview={() => {
          setPreviewVisible(false);
          setPreviewImage('');
          setPreviewTitle('');
        }}
        onClosePdfPreview={() => {
          setPdfPreviewVisible(false);
          setPdfPreviewUrl('');
          setPdfPreviewTitle('');
        }}
        onCloseTextPreview={() => {
          setTextPreviewVisible(false);
          setTextPreviewContent('');
          setTextPreviewTitle('');
          setTextPreviewFileId(undefined);
        }}
        onCloseUnsupportedFile={() => {
          setUnsupportedFileModalVisible(false);
          setUnsupportedFileItem(null);
        }}
        onDownload={handleDownload}
        onFileUpdated={handleFileUpdate}
        getOriginalFilename={getOriginalFilename}
      />
    </Layout>
  );
};

export default Dashboard;