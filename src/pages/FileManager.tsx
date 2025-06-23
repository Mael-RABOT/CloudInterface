import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Dropdown,
  Menu,
  Modal,
  Form,
  Upload,
  message,
  Typography,
  Row,
  Col,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  Pagination,
  Checkbox,
  Popconfirm,
  List,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  UploadOutlined,
  FolderOutlined,
  FileOutlined,
  MoreOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  ReloadOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CloudUploadOutlined,
  FolderAddOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { itemsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { themeConstants } from '../theme';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;

// File type configurations
const fileTypes = {
  PDF: { icon: <FileOutlined style={{ color: themeConstants.colors.error }} />, color: themeConstants.colors.error },
  DOCX: { icon: <FileOutlined style={{ color: themeConstants.colors.primary[600] }} />, color: themeConstants.colors.primary[600] },
  EXCEL: { icon: <FileOutlined style={{ color: themeConstants.colors.success }} />, color: themeConstants.colors.success },
  POWERPOINT: { icon: <FileOutlined style={{ color: themeConstants.colors.error }} />, color: themeConstants.colors.error },
  ZIP: { icon: <FileOutlined style={{ color: themeConstants.colors.info }} />, color: themeConstants.colors.info },
  TEXT: { icon: <FileOutlined style={{ color: themeConstants.colors.neutral[500] }} />, color: themeConstants.colors.neutral[500] },
  FILE: { icon: <FileOutlined style={{ color: themeConstants.colors.neutral[500] }} />, color: themeConstants.colors.neutral[500] },
};

const FileManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const items = await itemsAPI.getMyItems();
      // Ensure items is always an array
      setFiles(Array.isArray(items) ? items : []);
    } catch (error) {
      message.error('Failed to load files');
      setFiles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort files - ensure files is always an array
  const filteredFiles = (Array.isArray(files) ? files : [])
    .filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = filterType === 'all' || getFileType(file.filename) === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'filename':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'contentType':
          comparison = a.contentType.localeCompare(b.contentType);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'ascend' ? comparison : -comparison;
    });

  // Pagination
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toUpperCase() || '';
    const typeMap: { [key: string]: string } = {
      'PDF': 'PDF',
      'DOC': 'DOCX',
      'DOCX': 'DOCX',
      'XLS': 'EXCEL',
      'XLSX': 'EXCEL',
      'PPT': 'POWERPOINT',
      'PPTX': 'POWERPOINT',
      'TXT': 'TEXT',
      'ZIP': 'ZIP',
      'RAR': 'ZIP',
    };
    return typeMap[ext] || 'FILE';
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const blob = await itemsAPI.downloadFile(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('File downloaded successfully');
    } catch (error) {
      message.error('Failed to download file');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await itemsAPI.deleteItem(id);
      message.success('File deleted successfully');
      loadFiles();
    } catch (error) {
      message.error('Failed to delete file');
    }
  };

  const handleUpload = async (file: File, location: string) => {
    try {
      setUploading(true);
      await itemsAPI.uploadFile(location, file);
      message.success('File uploaded successfully');
      setIsUploadModalVisible(false);
      loadFiles();
    } catch (error) {
      message.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'filename',
      key: 'filename',
      render: (filename: string, record: any) => (
        <Space>
          <Checkbox
            checked={selectedFiles.includes(record.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedFiles([...selectedFiles, record.id]);
              } else {
                setSelectedFiles(selectedFiles.filter(id => id !== record.id));
              }
            }}
          />
          {fileTypes[getFileType(filename) as keyof typeof fileTypes]?.icon || <FileOutlined />}
          <div>
            <div style={{ fontWeight: 500 }}>
              {filename}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.location}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'contentType',
      key: 'contentType',
      render: (contentType: string, record: any) => (
        <Text>{getFileType(record.filename)}</Text>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => <Text type="secondary">{formatTimeAgo(createdAt)}</Text>,
    },
    {
      title: 'Owner',
      dataIndex: 'user',
      key: 'user',
      render: () => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{user?.username || 'Unknown'}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Badge
          status="success"
          text="Active"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownload(record.id, record.filename)}
            />
          </Tooltip>
          <Tooltip title="Share">
            <Button type="text" icon={<ShareAltOutlined />} size="small" />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Rename',
                },
                {
                  key: 'copy',
                  icon: <CopyOutlined />,
                  label: 'Copy',
                },
                {
                  key: 'cut',
                  icon: <EditOutlined />,
                  label: 'Cut',
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Grid view render
  const renderGridView = () => (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 6,
        xxl: 8,
      }}
      dataSource={paginatedFiles}
      renderItem={(item) => (
        <List.Item>
          <Card
            hoverable
            size="small"
            style={{
              textAlign: 'center',
              border: selectedFiles.includes(item.id) ? `2px solid ${themeConstants.colors.primary[600]}` : undefined,
            }}
            onClick={() => {
              if (selectedFiles.includes(item.id)) {
                setSelectedFiles(selectedFiles.filter(id => id !== item.id));
              } else {
                setSelectedFiles([...selectedFiles, item.id]);
              }
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {fileTypes[getFileType(item.filename) as keyof typeof fileTypes]?.icon || <FileOutlined />}
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 12 }}>
                {item.filename}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 10 }}>
              {formatTimeAgo(item.createdAt)}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Space size="small">
                <Tooltip title="View">
                  <Button type="text" icon={<EyeOutlined />} size="small" />
                </Tooltip>
                <Tooltip title="Download">
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item.id, item.filename);
                    }}
                  />
                </Tooltip>
                <Dropdown
                  menu={{
                    items: [
                      { key: 'edit', icon: <EditOutlined />, label: 'Rename' },
                      { key: 'share', icon: <ShareAltOutlined />, label: 'Share' },
                      {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: 'Delete',
                        danger: true,
                        onClick: () => handleDelete(item.id),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </Space>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading files...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: themeConstants.spacing.xl }}>
        <Title level={2} style={{ margin: 0 }}>
          File Manager
        </Title>
        <Text type="secondary">
          Manage and organize your files
        </Text>
      </div>

      {/* Toolbar */}
      <Card style={{ marginBottom: themeConstants.spacing.lg }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search files..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="File type"
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              <Option value="PDF">PDF</Option>
              <Option value="DOCX">Word</Option>
              <Option value="EXCEL">Excel</Option>
              <Option value="POWERPOINT">PowerPoint</Option>
              <Option value="TEXT">Text</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="filename">Name</Option>
              <Option value="createdAt">Created</Option>
              <Option value="contentType">Type</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<SortAscendingOutlined />}
              onClick={() => setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend')}
              style={{ width: '100%' }}
            >
              {sortOrder === 'ascend' ? 'Ascending' : 'Descending'}
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setIsUploadModalVisible(true)}
              >
                Upload Files
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadFiles}>
                Refresh
              </Button>
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Text type="secondary">
              {selectedFiles.length} of {filteredFiles.length} files selected
            </Text>
          </Col>
        </Row>
      </Card>

      {/* File Content */}
      <Card>
        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={paginatedFiles}
            pagination={false}
            rowKey="id"
            size="small"
          />
        ) : (
          renderGridView()
        )}

        {/* Pagination */}
        <div style={{ marginTop: themeConstants.spacing.lg, textAlign: 'right' }}>
          <Pagination
            current={currentPage}
            total={filteredFiles.length}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            }}
          />
        </div>
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload File"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          onFinish={(values) => {
            if (values.file && values.file[0]) {
              handleUpload(values.file[0], values.location || '/');
            }
          }}
          layout="vertical"
        >
          <Form.Item
            name="location"
            label="Location"
            initialValue="/"
          >
            <Input placeholder="Enter file location (e.g., /documents)" />
          </Form.Item>

          <Form.Item
            name="file"
            label="File"
            rules={[{ required: true, message: 'Please select a file' }]}
          >
            <Upload.Dragger
              beforeUpload={() => false}
              accept="*/*"
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 48, color: themeConstants.colors.primary[600] }} />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for text files, images, PDFs, and common document formats.
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              block
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FileManager;