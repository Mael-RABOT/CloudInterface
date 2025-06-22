import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Upload,
  Input,
  message,
  Modal,
  Image,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Popconfirm,
  Tree,
  Progress,
  Tooltip,
  Badge,
  Form
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
  SearchOutlined,
  CloudUploadOutlined,
  FileZipOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import { itemsAPI } from '../services/api';
import type { Item } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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

const FileManager: React.FC = () => {
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
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([ "" ]);
  const { logout, user } = useAuth();
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState('');
  const [currentUploadFile, setCurrentUploadFile] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

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
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <FileTextOutlined className="file-icon text" />;
      case 'txt':
      case 'md':
      case 'json':
      case 'xml':
        return <FileTextOutlined className="file-icon text" />;
      default:
        return <FileUnknownOutlined className="file-icon text" />;
    }
  };

  // Enhanced upload handler
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

        setUploadModalVisible(false);
        setUploadProgress(0);
        setSelectedFiles([]);
        setCurrentUploadFile('');
        uploadForm.resetFields();
        loadItems();
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

  // Handle file download
  const handleDownload = async (item: Item) => {
    try {
      const blob = await itemsAPI.downloadFile(item.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getOriginalFilename(item.filename);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Download started');
    } catch (error: any) {
      message.error('Download failed');
    }
  };

  // Handle file preview
  const handlePreview = async (item: Item) => {
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
                 item.filename.endsWith('.md')) {
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
      message.error(`Failed to preview ${item.filename}: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle file deletion
  const handleDelete = async (item: Item) => {
    try {
      await itemsAPI.deleteItem(item.id);
      message.success('File deleted successfully!');
      loadItems();
    } catch (error: any) {
      message.error('Delete failed');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select files to delete');
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const totalFiles = selectedRowKeys.length;
      let completedFiles = 0;
      const results: any[] = [];

      for (const key of selectedRowKeys) {
        try {
          await itemsAPI.deleteItem(Number(key));
          results.push(key);
          completedFiles++;

          // Show progress for each file
          const fileName = filteredItems.find(item => item.id === key)?.filename || 'Unknown file';
          message.success(`Deleted: ${getOriginalFilename(fileName)}`);
        } catch (error: any) {
          console.error(`Delete error for file ${key}:`, error);
          const fileName = filteredItems.find(item => item.id === key)?.filename || 'Unknown file';
          message.error(`Failed to delete ${getOriginalFilename(fileName)}: ${error.message || 'Unknown error'}`);
        }
      }

      const successCount = results.length;
      const failedCount = totalFiles - successCount;

      if (failedCount === 0) {
        message.success(`All ${totalFiles} files deleted successfully!`);
      } else {
        message.warning(`${successCount} files deleted, ${failedCount} failed`);
      }

      setSelectedRowKeys([]);
      loadItems();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      message.error('Bulk delete failed: Please try again');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'FILE',
      key: 'file',
      width: '35%',
      render: (item: Item) => (
        <Space size="small">
          {getFileIcon(item)}
          <span className="terminal-text" style={{ fontSize: '11px' }}>{getOriginalFilename(item.filename)}</span>
        </Space>
      ),
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
      width: '25%',
      render: (location: string) => (
        <span className="terminal-text" style={{ fontSize: '11px' }}>
          {location || 'Root'}
        </span>
      ),
    },
    {
      title: 'TYPE',
      dataIndex: 'contentType',
      key: 'contentType',
      width: '15%',
      render: (contentType: string) => (
        <Badge
          count={contentType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
          style={{ backgroundColor: '#00ff00', color: '#000', fontSize: '10px' }}
          size="small"
        />
      ),
    },
    {
      title: 'DATE',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date: string) => (
        <span className="terminal-text" style={{ fontSize: '11px' }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: '10%',
      render: (item: Item) => (
        <Space size="small">
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(item)}
              className="retro-button"
              size="small"
              style={{ padding: '2px 4px', minWidth: 'auto' }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(item)}
              className="retro-button"
              size="small"
              style={{ padding: '2px 4px', minWidth: 'auto' }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this file?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(item)}
            okText="DELETE"
            cancelText="CANCEL"
            okType="danger"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="retro-button"
                size="small"
                style={{ padding: '2px 4px', minWidth: 'auto' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadItems();
  }, []);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  return (
    <div className="terminal-container dashboard-container">
      {/* Compact ASCII Header */}
      <div className="ascii-header compact">
        {`╔══════════════════════════════════════════════════════════════╗
║                    CLOUD INTERFACE v2.0                      ║
║                        TERMINAL ACCESS                       ║
╚══════════════════════════════════════════════════════════════╝`}
      </div>

      {/* Compact Status Bar */}
      <div className="status-message success compact">
        <Text className="terminal-text">
          USER: {user?.username} | ROLES: {user?.roles?.join(', ') || 'USER'} | LOCATION: {currentLocation || 'Root'} | FILES: {filteredItems.length}
          <span className="cursor" />
        </Text>
      </div>

      <div className="dashboard-content">
        <Row gutter={[12, 12]} style={{ height: '100%', margin: 0 }}>
          {/* Compact Folder Tree Panel */}
          <Col xs={24} md={5} style={{ height: '100%', padding: 0 }}>
            <Card
              title="FOLDERS"
              className="retro-card compact"
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              extra={
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadItems}
                  className="retro-button"
                  size="small"
                />
              }
              bodyStyle={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column' }}
            >
              <div className="file-tree compact" style={{ flex: 1, overflowY: 'auto' }}>
                <Tree
                  treeData={folderTree}
                  onSelect={handleFolderSelect}
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys)}
                  showIcon
                  className="terminal-text"
                  style={{ fontSize: '12px' }}
                />
              </div>
            </Card>
          </Col>

          {/* Main Content - Optimized */}
          <Col xs={24} md={19} style={{ height: '100%', padding: 0 }}>
            {/* Compact Search and Upload Bar */}
            <Card className="retro-card compact" style={{ marginBottom: '8px' }} bodyStyle={{ padding: '8px' }}>
              <Row gutter={[8, 8]} align="middle">
                <Col flex="auto">
                  <Search
                    placeholder="Search files..."
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="retro-input"
                    prefix={<SearchOutlined />}
                    size="middle"
                  />
                </Col>
                {selectedRowKeys.length > 0 && (
                  <Col>
                    <Popconfirm
                      title={`Delete ${selectedRowKeys.length} selected file${selectedRowKeys.length !== 1 ? 's' : ''}?`}
                      description="This action cannot be undone."
                      onConfirm={handleBulkDelete}
                      okText="DELETE"
                      cancelText="CANCEL"
                      okType="danger"
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={bulkDeleteLoading}
                        className="retro-button"
                        size="middle"
                      >
                        DELETE ({selectedRowKeys.length})
                      </Button>
                    </Popconfirm>
                  </Col>
                )}
                <Col>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    onClick={() => setUploadModalVisible(true)}
                    className="retro-button"
                    size="middle"
                  >
                    UPLOAD
                  </Button>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadItems}
                    className="retro-button"
                    size="middle"
                  >
                    REFRESH
                  </Button>
                </Col>
                <Col>
                  <Button
                    onClick={logout}
                    className="retro-button"
                    size="middle"
                  >
                    LOGOUT
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Files Table - Full Height */}
            <Card className="retro-card compact" style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column' }}>
              <Table
                columns={columns}
                dataSource={filteredItems}
                rowKey="id"
                loading={loading}
                className="retro-table compact"
                rowSelection={{
                  selectedRowKeys,
                  onChange: (newSelectedRowKeys) => {
                    setSelectedRowKeys(newSelectedRowKeys);
                  },
                  getCheckboxProps: (record) => ({
                    name: record.filename,
                  }),
                }}
                pagination={{
                  pageSize: 15,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} files`,
                  size: 'small',
                  showSizeChanger: false,
                }}
                locale={{
                  emptyText: (
                    <div className="terminal-text" style={{ textAlign: 'center', padding: '20px' }}>
                      NO FILES FOUND
                      <br />
                      UPLOAD YOUR FIRST FILE TO GET STARTED
                    </div>
                  )
                }}
                style={{ flex: 1 }}
                scroll={{ y: 'calc(100vh - 280px)' }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Enhanced Upload Modal */}
      <Modal
        title="UPLOAD FILES"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setSelectedFiles([]);
          setUploadProgress(0);
          setCurrentUploadFile('');
          uploadForm.resetFields();
        }}
        footer={null}
        width={600}
        className="retro-modal"
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{ location: currentLocation }}
        >
          <Form.Item
            name="location"
            label="LOCATION"
            rules={[{ required: true, message: 'Please enter a location!' }]}
          >
            <Input
              placeholder="e.g., documents/work, photos/vacation"
              className="retro-input"
              prefix={<FolderOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="SELECT FILES"
            required
          >
            <Upload
              beforeUpload={(file) => {
                setSelectedFiles(prev => [...prev, file]);
                return false;
              }}
              showUploadList={false}
              accept="*/*"
              multiple
            >
              <Button
                icon={<UploadOutlined />}
                className="retro-button"
                block
              >
                CHOOSE FILES
              </Button>
            </Upload>
            {selectedFiles.length > 0 && (
              <div className="status-message success" style={{ marginTop: '10px' }}>
                <div className="terminal-text">
                  <div style={{ marginBottom: '8px' }}>
                    SELECTED FILES ({selectedFiles.length}):
                  </div>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{
                      fontSize: '12px',
                      marginBottom: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#001100',
                      border: '1px solid #00ff00',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{getOriginalFilename(file.name)} ({Math.round(file.size / 1024)} KB)</span>
                      <Tooltip title="Remove this file">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="retro-button"
                          style={{ padding: '0 4px', minWidth: 'auto' }}
                        />
                      </Tooltip>
                    </div>
                  ))}
                  <div style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#002200',
                    border: '1px solid #00aa00',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    TOTAL SIZE: {Math.round(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024)} KB
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setSelectedFiles([])}
                  className="retro-button"
                  style={{ marginTop: '8px' }}
                >
                  CLEAR ALL
                </Button>
              </div>
            )}
          </Form.Item>

          {uploadProgress > 0 && (
            <Form.Item label="UPLOAD PROGRESS">
              {currentUploadFile && (
                <div className="terminal-text" style={{ marginBottom: '8px', fontSize: '12px' }}>
                  UPLOADING: {currentUploadFile}
                </div>
              )}
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? 'success' : 'active'}
                className="retro-progress"
                format={(percent) => `${percent}% (${Math.round((uploadProgress / 100) * selectedFiles.length)}/${selectedFiles.length} files)`}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploadLoading}
              className="retro-button"
              block
              size="large"
              disabled={selectedFiles.length === 0}
            >
              {uploadLoading ? 'UPLOADING...' : `UPLOAD ${selectedFiles.length} FILE${selectedFiles.length !== 1 ? 'S' : ''}`}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewImage('');
        }}
        className="retro-modal"
        width={800}
      >
        <Image
          alt={previewTitle}
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>

      {/* Text Preview Modal */}
      <Modal
        open={textPreviewVisible}
        title={textPreviewTitle}
        footer={null}
        onCancel={() => {
          setTextPreviewVisible(false);
          setTextPreviewContent('');
        }}
        className="retro-modal"
        width={800}
      >
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '14px',
            lineHeight: '1.4',
            backgroundColor: '#000',
            color: '#00ff00',
            padding: '12px',
            border: '1px solid #00ff00',
            fontFamily: 'VT323, monospace',
            textShadow: '0 0 5px #00ff00'
          }}>
            {textPreviewContent}
          </pre>
        </div>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        open={pdfPreviewVisible}
        title={pdfPreviewTitle}
        footer={null}
        onCancel={() => {
          setPdfPreviewVisible(false);
          if (pdfPreviewUrl) {
            window.URL.revokeObjectURL(pdfPreviewUrl);
          }
          setPdfPreviewUrl('');
        }}
        className="retro-modal"
        width={900}
        style={{ top: 20 }}
      >
        <div style={{
          height: '70vh',
          border: '1px solid #00ff00',
          backgroundColor: '#000'
        }}>
          <iframe
            src={`${pdfPreviewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#fff'
            }}
            title={pdfPreviewTitle}
          />
        </div>
        <div style={{
          marginTop: '15px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <Button
            onClick={() => {
              setPdfPreviewVisible(false);
              if (pdfPreviewUrl) {
                window.URL.revokeObjectURL(pdfPreviewUrl);
              }
              setPdfPreviewUrl('');
            }}
            className="retro-button"
          >
            Close
          </Button>
          <Button
            type="primary"
            onClick={() => {
              if (pdfPreviewUrl) {
                window.open(pdfPreviewUrl, '_blank');
              }
            }}
            className="retro-button"
            icon={<DownloadOutlined />}
          >
            Open in New Tab
          </Button>
        </div>
      </Modal>

      {/* Unsupported File Modal */}
      <Modal
        open={unsupportedFileModalVisible}
        title={unsupportedFileItem ? getOriginalFilename(unsupportedFileItem.filename) : "Unsupported File"}
        footer={null}
        onCancel={() => {
          setUnsupportedFileModalVisible(false);
          setUnsupportedFileItem(null);
        }}
        className="retro-modal"
        width={500}
      >
        <div className="terminal-text" style={{ marginBottom: '20px' }}>
          <p>This file type ({unsupportedFileItem?.contentType}) cannot be previewed.</p>
          <p>Please download the file to view its contents.</p>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          borderTop: '1px solid #00ff00',
          paddingTop: '15px'
        }}>
          <Button
            onClick={() => {
              setUnsupportedFileModalVisible(false);
              setUnsupportedFileItem(null);
            }}
            className="retro-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => {
              if (unsupportedFileItem) {
                handleDownload(unsupportedFileItem);
              }
              setUnsupportedFileModalVisible(false);
              setUnsupportedFileItem(null);
            }}
            className="retro-button"
            icon={<DownloadOutlined />}
          >
            Download
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FileManager;