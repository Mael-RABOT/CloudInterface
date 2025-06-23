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
  Form,
  theme
} from 'antd';
import {
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
  FileUnknownOutlined
} from '@ant-design/icons';
import { itemsAPI } from '../services/api';
import type { Item } from '../services/api';
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

const getOriginalFilename = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;

  const extension = filename.substring(lastDotIndex);
  const nameWithId = filename.substring(0, lastDotIndex);

  const lastDashIndex = nameWithId.lastIndexOf('-');
  if (lastDashIndex === -1) return filename;

  const potentialId = nameWithId.substring(lastDashIndex + 1);
  if (/^[a-zA-Z0-9]+$/.test(potentialId)) {
    return nameWithId.substring(0, lastDashIndex) + extension;
  }

  return filename;
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
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([""]);
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState('');
  const [currentUploadFile, setCurrentUploadFile] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const { token } = theme.useToken();

  // Load user's items
  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await itemsAPI.getMyItems();
      setItems(data);
      setFilteredItems(data);
      buildFolderTree(data);
    } catch (error: any) {
      message.error({
        content: 'Failed to load files',
        icon: <ReloadOutlined />,
        style: {
          background: token.colorBgElevated,
          border: `1px solid ${token.colorError}`,
          color: token.colorError,
          fontFamily: token.fontFamily
        }
      });
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
      icon: <HomeOutlined style={{ color: token.colorPrimary }} />,
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
            icon: <FolderOutlined style={{ color: token.colorWarning }} />,
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
        setFilteredItems(items);
      } else {
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
    const extension = item.filename.split('.').pop()?.toLowerCase();
    const contentType = item.contentType.toLowerCase();

    if (contentType.includes('image')) {
      return <FileImageOutlined style={{ color: token.colorInfo }} />;
    } else if (contentType.includes('pdf')) {
      return <FilePdfOutlined style={{ color: token.colorError }} />;
    } else if (contentType.includes('text')) {
      return <FileTextOutlined style={{ color: token.colorWarning }} />;
    } else if (extension === 'zip' || extension === 'rar' || extension === '7z') {
      return <FileZipOutlined style={{ color: token.colorPrimary }} />;
    } else if (extension === 'doc' || extension === 'docx') {
      return <FileWordOutlined style={{ color: token.colorInfo }} />;
    } else if (extension === 'xls' || extension === 'xlsx') {
      return <FileExcelOutlined style={{ color: token.colorSuccess }} />;
    } else if (extension === 'ppt' || extension === 'pptx') {
      return <FilePptOutlined style={{ color: token.colorWarning }} />;
    } else {
      return <FileUnknownOutlined style={{ color: token.colorTextSecondary }} />;
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      message.warning('Please select files to upload');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentUploadFile(file.name);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('location', currentLocation);

        await itemsAPI.uploadItem(formData, (progress) => {
          setUploadProgress(progress);
        });

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      message.success({
        content: `Successfully uploaded ${selectedFiles.length} file(s)`,
        icon: <CloudUploadOutlined />,
        style: {
          background: token.colorBgElevated,
          border: `1px solid ${token.colorSuccess}`,
          color: token.colorSuccess,
          fontFamily: token.fontFamily
        }
      });

      setUploadModalVisible(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      setCurrentUploadFile('');
      uploadForm.resetFields();
      loadItems();
    } catch (error: any) {
      message.error({
        content: `Upload failed: ${error.message || 'Unknown error'}`,
        icon: <CloudUploadOutlined />,
        style: {
          background: token.colorBgElevated,
          border: `1px solid ${token.colorError}`,
          color: token.colorError,
          fontFamily: token.fontFamily
        }
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle file download
  const handleDownload = async (item: Item) => {
    try {
      const response = await itemsAPI.downloadItem(item.id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', getOriginalFilename(item.filename));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      message.error(`Download failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle file preview
  const handlePreview = async (item: Item) => {
    try {
      const response = await itemsAPI.downloadItem(item.id);
      const contentType = item.contentType.toLowerCase();

      if (contentType.includes('image')) {
        const url = window.URL.createObjectURL(new Blob([response]));
        setPreviewImage(url);
        setPreviewTitle(getOriginalFilename(item.filename));
        setPreviewVisible(true);
      } else if (contentType.includes('pdf')) {
        const url = window.URL.createObjectURL(new Blob([response]));
        setPdfPreviewUrl(url);
        setPdfPreviewTitle(getOriginalFilename(item.filename));
        setPdfPreviewVisible(true);
      } else if (contentType.includes('text')) {
        const text = await new Blob([response]).text();
        setTextPreviewContent(text);
        setTextPreviewTitle(getOriginalFilename(item.filename));
        setTextPreviewVisible(true);
      } else {
        setUnsupportedFileItem(item);
        setUnsupportedFileModalVisible(true);
      }
    } catch (error: any) {
      message.error(`Preview failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle file delete
  const handleDelete = async (item: Item) => {
    try {
      await itemsAPI.deleteItem(item.id);
      message.success(`Deleted: ${getOriginalFilename(item.filename)}`);
      loadItems();
    } catch (error: any) {
      message.error(`Failed to delete ${getOriginalFilename(item.filename)}: ${error.message || 'Unknown error'}`);
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
      const results = await Promise.allSettled(
        selectedRowKeys.map(key => itemsAPI.deleteItem(key as string))
      );

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failedCount = selectedRowKeys.length - successCount;

      if (failedCount === 0) {
        message.success(`All ${selectedRowKeys.length} files deleted successfully!`);
      } else {
        message.warning(`${successCount} files deleted, ${failedCount} failed`);
      }

      setSelectedRowKeys([]);
      loadItems();
    } catch (error: any) {
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
          <Text style={{
            fontSize: token.fontSizeSM,
            fontFamily: token.fontFamily,
            color: token.colorText
          }}>
            {getOriginalFilename(item.filename)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
      width: '25%',
      render: (location: string) => (
        <Text style={{
          fontSize: token.fontSizeSM,
          fontFamily: token.fontFamily,
          color: token.colorTextSecondary
        }}>
          {location || 'Root'}
        </Text>
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
          style={{
            backgroundColor: token.colorPrimary,
            color: token.colorTextInverse,
            fontSize: token.fontSizeSM,
            fontFamily: token.fontFamily
          }}
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
        <Text style={{
          fontSize: token.fontSizeSM,
          fontFamily: token.fontFamily,
          color: token.colorTextTertiary
        }}>
          {new Date(date).toLocaleDateString()}
        </Text>
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
              size="small"
              style={{
                color: token.colorPrimary,
                padding: '2px 4px',
                minWidth: 'auto'
              }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(item)}
              size="small"
              style={{
                color: token.colorInfo,
                padding: '2px 4px',
                minWidth: 'auto'
              }}
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
                size="small"
                style={{
                  padding: '2px 4px',
                  minWidth: 'auto'
                }}
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        marginBottom: token.marginMD,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: token.marginSM
      }}>
        <Space size="middle">
          <Search
            placeholder="Search files..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: 300,
              fontFamily: token.fontFamily
            }}
            allowClear
          />

          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold'
            }}
          >
            UPLOAD FILES
          </Button>

          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} selected files?`}
              description="This action cannot be undone."
              onConfirm={handleBulkDelete}
              okText="DELETE ALL"
              cancelText="CANCEL"
              okType="danger"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={bulkDeleteLoading}
                style={{
                  fontFamily: token.fontFamily,
                  fontWeight: 'bold'
                }}
              >
                DELETE SELECTED ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </Space>

        <Space size="small">
          <Text style={{
            color: token.colorTextSecondary,
            fontFamily: token.fontFamily,
            fontSize: token.fontSizeSM
          }}>
            {filteredItems.length} files
          </Text>

          <Button
            icon={<ReloadOutlined />}
            onClick={loadItems}
            loading={loading}
            style={{
              fontFamily: token.fontFamily
            }}
          />
        </Space>
      </div>

      {/* Main Content */}
      <Row gutter={[token.marginMD, token.marginMD]} style={{ flex: 1, margin: 0 }}>
        {/* Folder Tree */}
        <Col xs={24} lg={6} style={{ height: '100%' }}>
          <Card
            title={
              <Space>
                <FolderOutlined style={{ color: token.colorPrimary }} />
                <Text style={{
                  color: token.colorPrimary,
                  fontFamily: token.fontFamily,
                  fontWeight: 'bold'
                }}>
                  FOLDERS
                </Text>
              </Space>
            }
            style={{
              height: '100%',
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`
            }}
            bodyStyle={{
              padding: token.paddingSM,
              height: 'calc(100% - 57px)',
              overflowY: 'auto'
            }}
          >
            <Tree
              treeData={folderTree}
              onSelect={handleFolderSelect}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              showIcon
              style={{
                fontFamily: token.fontFamily,
                fontSize: token.fontSizeSM
              }}
            />
          </Card>
        </Col>

        {/* File Table */}
        <Col xs={24} lg={18} style={{ height: '100%' }}>
          <Card
            style={{
              height: '100%',
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`
            }}
            bodyStyle={{
              padding: token.paddingSM,
              height: 'calc(100% - 57px)',
              overflowY: 'auto'
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredItems}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} files`,
                style: {
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM
                }
              }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              scroll={{ y: 'calc(100vh - 400px)' }}
              style={{
                fontFamily: token.fontFamily
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal
        title={
          <Space>
            <CloudUploadOutlined style={{ color: token.colorPrimary }} />
            <Text style={{
              color: token.colorPrimary,
              fontFamily: token.fontFamily,
              fontWeight: 'bold'
            }}>
              UPLOAD FILES
            </Text>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
        style={{
          fontFamily: token.fontFamily
        }}
      >
        <Form
          form={uploadForm}
          onFinish={handleUpload}
          layout="vertical"
        >
          <Form.Item
            name="files"
            label="Select Files"
            rules={[{ required: true, message: 'Please select files to upload' }]}
          >
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              onChange={(info) => setSelectedFiles(info.fileList.map(f => f.originFileObj!))}
              accept="*/*"
              style={{
                background: token.colorBgContainer,
                border: `2px dashed ${token.colorBorder}`,
                fontFamily: token.fontFamily
              }}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 48, color: token.colorPrimary }} />
              </p>
              <p style={{ color: token.colorText, fontFamily: token.fontFamily }}>
                Click or drag files to upload
              </p>
            </Upload.Dragger>
          </Form.Item>

          {uploadProgress > 0 && (
            <Form.Item label="Upload Progress">
              <Progress
                percent={uploadProgress}
                status={uploadLoading ? 'active' : 'success'}
                style={{ fontFamily: token.fontFamily }}
              />
              {currentUploadFile && (
                <Text style={{
                  color: token.colorTextSecondary,
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM,
                  display: 'block',
                  marginTop: token.marginXS
                }}>
                  Uploading: {currentUploadFile}
                </Text>
              )}
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploadLoading}
                icon={<CloudUploadOutlined />}
                style={{
                  fontFamily: token.fontFamily,
                  fontWeight: 'bold'
                }}
              >
                {uploadLoading ? 'UPLOADING...' : 'UPLOAD FILES'}
              </Button>
              <Button
                onClick={() => setUploadModalVisible(false)}
                style={{
                  fontFamily: token.fontFamily
                }}
              >
                CANCEL
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        style={{
          fontFamily: token.fontFamily
        }}
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
        width={800}
        style={{
          fontFamily: token.fontFamily
        }}
      >
        <pre style={{
          background: token.colorBgContainer,
          padding: token.paddingMD,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          fontFamily: token.fontFamily,
          fontSize: token.fontSizeSM,
          color: token.colorText,
          maxHeight: '400px',
          overflow: 'auto'
        }}>
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
        style={{
          fontFamily: token.fontFamily
        }}
      >
        <iframe
          src={pdfPreviewUrl}
          style={{ width: '100%', height: '70vh', border: 'none' }}
          title={pdfPreviewTitle}
        />
      </Modal>

      {/* Unsupported File Modal */}
      <Modal
        open={unsupportedFileModalVisible}
        title="Unsupported File Type"
        onCancel={() => setUnsupportedFileModalVisible(false)}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (unsupportedFileItem) {
                handleDownload(unsupportedFileItem);
                setUnsupportedFileModalVisible(false);
              }
            }}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold'
            }}
          >
            DOWNLOAD INSTEAD
          </Button>
        ]}
        style={{
          fontFamily: token.fontFamily
        }}
      >
        <Text style={{
          color: token.colorText,
          fontFamily: token.fontFamily
        }}>
          This file type cannot be previewed. You can download it instead.
        </Text>
      </Modal>
    </div>
  );
};

export default FileManager;