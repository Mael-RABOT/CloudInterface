import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  Upload,
  Input,
  message,
  Modal,
  Image,
  Typography,
  Tree,
  Progress,
  Form,
  Avatar,
  Spin,
  Drawer,
  Dropdown
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FolderOutlined,
  HomeOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  FileZipOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileUnknownOutlined,
  MoreOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { itemsAPI } from '../../services/api';
import type { Item } from '../../services/api';
import type { Key } from 'antd/es/table/interface';

const { Text } = Typography;
const { Search } = Input;

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  icon?: React.ReactNode;
}

// Helper function to extract original filename by removing ID suffix
const getOriginalFilename = (filename: string): string => {
  // Pattern: <name>-<some_id>.<extension>
  // Remove the ID part before the last dot
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename; // No extension found

  const extension = filename.substring(lastDotIndex);
  const nameWithId = filename.substring(0, lastDotIndex);

  // Find the last dash followed by what looks like an ID
  const lastDashIndex = nameWithId.lastIndexOf('-');
  if (lastDashIndex === -1) return filename; // No dash found

  // Check if what follows the dash looks like an ID (alphanumeric)
  const potentialId = nameWithId.substring(lastDashIndex + 1);
  if (/^[a-zA-Z0-9]+$/.test(potentialId)) {
    // It's likely an ID, remove it
    return nameWithId.substring(0, lastDashIndex) + extension;
  }

  return filename; // No ID pattern found, return original
};

const FileManagerMobile: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>(items);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [textPreviewVisible, setTextPreviewVisible] = useState<boolean>(false);
  const [textPreviewContent, setTextPreviewContent] = useState<string>('');
  const [textPreviewTitle, setTextPreviewTitle] = useState<string>('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [unsupportedFileModalVisible, setUnsupportedFileModalVisible] = useState(false);
  const [unsupportedFileItem, setUnsupportedFileItem] = useState<Item | null>(null);
  const [uploadForm] = Form.useForm();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folderTree, setFolderTree] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(['']);
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState('');
  const [currentUploadFile, setCurrentUploadFile] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [folderDrawerVisible, setFolderDrawerVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load user's items
  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await itemsAPI.getMyItems();
      setItems(data);
      setFilteredItems(data);
      buildFolderTree(data);
    } catch (error: any) {
      message.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Build folder tree from items
  const buildFolderTree = (items: Item[]) => {
    const folderMap = new Map<string, TreeNode>();

    // Add root folder
    folderMap.set('', {
      title: 'Root',
      key: '',
      icon: <HomeOutlined className="file-icon folder" />,
      children: []
    });

    // Process each item's location
    items.forEach(item => {
      const pathParts = item.location.split('/').filter(part => part.trim());
      let currentPath = '';

      pathParts.forEach((part) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!folderMap.has(currentPath)) {
          folderMap.set(currentPath, {
            title: part,
            key: currentPath,
            icon: <FolderOutlined className="file-icon folder" />,
            children: []
          });

          // Add to parent's children
          const parent = folderMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(folderMap.get(currentPath)!);
          }
        }
      });
    });

    const rootNode = folderMap.get('');
    setFolderTree(rootNode ? [rootNode] : []);
  };

  // Handle folder selection
  const handleFolderSelect = (selectedKeys: Key[]) => {
    if (selectedKeys.length > 0) {
      const selectedPath = selectedKeys[0] as string;
      setCurrentLocation(selectedPath);
      if (selectedPath === '') {
        // Show all files when Root is selected
        setFilteredItems(items);
      } else {
        // Filter by specific location
        filterItemsByLocation(selectedPath);
      }
      setFolderDrawerVisible(false);
    }
  };

  // Filter items by location
  const filterItemsByLocation = (location: string) => {
    const filtered = items.filter(item => item.location === location);
    setFilteredItems(filtered);
  };

  // Handle search
  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.filename.toLowerCase().includes(value.toLowerCase()) ||
        item.location.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  // Get file icon based on content type and extension
  const getFileIcon = (item: Item) => {
    const { contentType, filename } = item;
    const extension = filename.split('.').pop()?.toLowerCase();

    if (contentType.startsWith('image/')) {
      return <FileImageOutlined className="file-icon image" />;
    }

    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined className="file-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined className="file-icon text" />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined className="file-icon text" />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined className="file-icon text" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileZipOutlined className="file-icon text" />;
      case 'txt':
      case 'md':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'css':
      case 'html':
      case 'json':
      case 'xml':
      case 'csv':
        return <FileTextOutlined className="file-icon text" />;
      default:
        return <FileUnknownOutlined className="file-icon text" />;
    }
  };

  // Handle upload
  const handleUpload = async (values: any) => {
    if (selectedFiles.length === 0) {
      message.error('Please select files');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentUploadFile(file.name);

        await itemsAPI.uploadFile(values.location || currentLocation, file);

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      message.success('Files uploaded successfully');
      setUploadModalVisible(false);
      setSelectedFiles([]);
      uploadForm.resetFields();
      loadItems();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
    }
  };

  // Handle download
  const handleDownload = async (item: Item) => {
    try {
      const blob = await itemsAPI.downloadFile(item.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', getOriginalFilename(item.filename));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Download started');
    } catch (error: any) {
      message.error('Download failed');
    }
  };

  // Handle preview
  const handlePreview = async (item: Item) => {
    setPreviewLoading(true);
    try {
      const blob = await itemsAPI.downloadFile(item.id);

      if (item.contentType.startsWith('image/')) {
        const url = window.URL.createObjectURL(blob);
        setPreviewImage(url);
        setPreviewTitle(getOriginalFilename(item.filename));
        setPreviewVisible(true);
      } else if (item.contentType === 'application/pdf' || item.filename.toLowerCase().endsWith('.pdf')) {
        // Handle PDF preview
        const url = window.URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
        setPdfPreviewTitle(getOriginalFilename(item.filename));
        setPdfPreviewVisible(true);
      } else if (item.contentType.startsWith('text/') ||
                 item.contentType === 'application/json' ||
                 item.contentType === 'application/xml' ||
                 item.filename.endsWith('.txt') ||
                 item.filename.endsWith('.json') ||
                 item.filename.endsWith('.xml') ||
                 item.filename.endsWith('.md') ||
                 item.filename.endsWith('.js') ||
                 item.filename.endsWith('.ts') ||
                 item.filename.endsWith('.jsx') ||
                 item.filename.endsWith('.tsx') ||
                 item.filename.endsWith('.css') ||
                 item.filename.endsWith('.html') ||
                 item.filename.endsWith('.csv')) {
        const text = await blob.text();
        setTextPreviewContent(text);
        setTextPreviewTitle(getOriginalFilename(item.filename));
        setTextPreviewVisible(true);
      } else {
        console.log("unsupported file type", item.contentType);
        message.warning(`Cannot preview ${getOriginalFilename(item.filename)}. This file type (${item.contentType}) cannot be previewed.`);
        setUnsupportedFileItem(item);
        setUnsupportedFileModalVisible(true);
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      message.error(`Failed to preview ${getOriginalFilename(item.filename)}: ${error.message || 'Unknown error'}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (item: Item) => {
    try {
      await itemsAPI.deleteItem(item.id);
      message.success('File deleted successfully');
      loadItems();
    } catch (error: any) {
      message.error('Delete failed');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.error('Please select files to delete');
      return;
    }

    setBulkDeleteLoading(true);
    try {
      await Promise.all(selectedRowKeys.map(key => itemsAPI.deleteItem(Number(key))));
      message.success('Files deleted successfully');
      setSelectedRowKeys([]);
      loadItems();
    } catch (error: any) {
      message.error('Bulk delete failed');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // File actions menu
  const getFileActions = (item: Item) => [
    {
      key: 'preview',
      icon: <EyeOutlined />,
      label: 'Preview',
      onClick: () => handlePreview(item)
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download',
      onClick: () => handleDownload(item)
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Are you sure you want to delete this file?',
          onOk: () => handleDelete(item),
          okText: 'Yes',
          cancelText: 'No'
        });
      }
    }
  ];

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="mobile-file-manager">
      {/* Header */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <Button
            icon={<MenuOutlined />}
            onClick={() => setFolderDrawerVisible(true)}
            className="mobile-menu-button"
          />
          <div className="mobile-title">
            <Text strong>CLOUD INTERFACE</Text>
            <Text type="secondary" className="mobile-subtitle">
              {currentLocation || 'Root'}
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadItems}
            loading={loading}
            className="mobile-refresh-button"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mobile-search-container">
        <Search
          placeholder="Search files..."
          onSearch={handleSearch}
          className="mobile-search"
          size="large"
        />
      </div>

      {/* Action Buttons */}
      <div className="mobile-actions">
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => setUploadModalVisible(true)}
          block
          className="mobile-upload-button"
        >
          UPLOAD FILES
        </Button>
        {selectedRowKeys.length > 0 && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBulkDelete}
            loading={bulkDeleteLoading}
            className="mobile-bulk-delete-button"
          >
            DELETE SELECTED ({selectedRowKeys.length})
          </Button>
        )}
      </div>

      {/* File List */}
      <div className="mobile-file-list">
        <List
          dataSource={filteredItems}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              className="mobile-file-item"
              onClick={() => handlePreview(item)}
              actions={[
                <Dropdown key="actions" menu={{ items: getFileActions(item) }} trigger={['click']}>
                  <Button icon={<MoreOutlined />} type="text" />
                </Dropdown>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={previewLoading ? <Spin size="small" /> : getFileIcon(item)}
                    className="mobile-file-avatar"
                  />
                }
                title={
                  <Text ellipsis className="mobile-file-title">
                    {getOriginalFilename(item.filename)}
                  </Text>
                }
                description={
                  <div className="mobile-file-details">
                    <Text type="secondary" className="mobile-file-size">
                      {item.contentType}
                    </Text>
                    <Text type="secondary" className="mobile-file-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* Folder Drawer */}
      <Drawer
        title="Folders"
        placement="left"
        onClose={() => setFolderDrawerVisible(false)}
        open={folderDrawerVisible}
        className="mobile-folder-drawer"
      >
        <Tree
          treeData={folderTree}
          onSelect={handleFolderSelect}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          className="mobile-folder-tree"
        />
      </Drawer>

      {/* Upload Modal */}
      <Modal
        title="Upload Files"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        className="mobile-upload-modal"
      >
        <Form form={uploadForm} onFinish={handleUpload} layout="vertical">
          <Form.Item name="location" label="Location">
            <Input placeholder="Enter folder path (optional)" />
          </Form.Item>

          <Form.Item label="Select Files">
            <Upload
              beforeUpload={() => false}
              onChange={({ fileList }) => {
                const files = fileList.map(f => f.originFileObj).filter(Boolean) as File[];
                setSelectedFiles(files);
              }}
              multiple
            >
              <Button icon={<UploadOutlined />} block>
                Choose Files
              </Button>
            </Upload>
          </Form.Item>

          {selectedFiles.length > 0 && (
            <div className="mobile-selected-files">
              <Text strong>Selected Files:</Text>
              {selectedFiles.map((file, index) => (
                <div key={index} className="mobile-selected-file">
                  <Text>{getOriginalFilename(file.name)}</Text>
                </div>
              ))}
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mobile-upload-progress">
              <Progress percent={uploadProgress} />
              {currentUploadFile && (
                <Text type="secondary">Uploading: {getOriginalFilename(currentUploadFile)}</Text>
              )}
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploadLoading}
              block
              disabled={selectedFiles.length === 0}
            >
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        className="mobile-preview-modal"
      >
        <Image
          alt={previewTitle}
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>

      {/* Text Preview Modal */}
      <Modal
        open={textPreviewVisible}
        title={textPreviewTitle}
        footer={null}
        onCancel={() => setTextPreviewVisible(false)}
        width="90%"
        className="mobile-text-preview-modal"
      >
        <pre className="mobile-text-preview-content">
          {textPreviewContent}
        </pre>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        open={pdfPreviewVisible}
        title={pdfPreviewTitle}
        footer={null}
        onCancel={() => setPdfPreviewVisible(false)}
        width="90%"
        className="mobile-pdf-preview-modal"
      >
        <iframe
          src={pdfPreviewUrl}
          style={{ width: '100%', height: '70vh' }}
          title="PDF Preview"
        />
      </Modal>

      {/* Unsupported File Modal */}
      <Modal
        open={unsupportedFileModalVisible}
        title="Unsupported File Type"
        onCancel={() => setUnsupportedFileModalVisible(false)}
        footer={[
          <Button key="download" onClick={() => {
            if (unsupportedFileItem) handleDownload(unsupportedFileItem);
            setUnsupportedFileModalVisible(false);
          }}>
            Download Instead
          </Button>
        ]}
      >
        <p>This file type cannot be previewed. You can download it instead.</p>
      </Modal>
    </div>
  );
};

export default FileManagerMobile;