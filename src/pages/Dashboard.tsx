import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  List,
  Avatar,
  Button,
  Space,
  Typography,
  Table,
  Badge,
  Tooltip,
  message,
  Spin,
} from 'antd';
import {
  CloudOutlined,
  FileOutlined,
  FolderOutlined,
  UserOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { itemsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { themeConstants } from '../theme';

const { Title, Text } = Typography;

interface DashboardData {
  totalFiles: number;
  storageUsed: string;
  recentFiles: any[];
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalFiles: 0,
    storageUsed: '0 MB',
    recentFiles: [],
    recentActivity: [],
  });
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const items = await itemsAPI.getMyItems();

      // Ensure items is always an array
      const itemsArray = Array.isArray(items) ? items : [];

      // Calculate storage used (simplified - in real app you'd get this from API)
      const totalSize = itemsArray.reduce((acc, item) => {
        // This is a simplified calculation - you'd need actual file sizes from API
        return acc + 1; // Assuming 1 unit per file for demo
      }, 0);

      // Get recent files (last 5)
      const recentFiles = itemsArray.slice(0, 5).map(item => ({
        id: item.id,
        name: item.filename,
        type: getFileType(item.filename),
        size: '1 MB', // Placeholder
        modified: item.createdAt,
        status: 'active',
        user: user?.username || 'Unknown',
      }));

      // Generate recent activity from files
      const recentActivity = itemsArray.slice(0, 5).map(item => ({
        id: item.id,
        action: 'Uploaded',
        file: item.filename,
        user: user?.username || 'Unknown',
        time: formatTimeAgo(item.createdAt),
        type: 'upload',
      }));

      setData({
        totalFiles: itemsArray.length,
        storageUsed: `${totalSize} MB`,
        recentFiles,
        recentActivity,
      });
    } catch (error) {
      message.error('Failed to load dashboard data');
      setData({
        totalFiles: 0,
        storageUsed: '0 MB',
        recentFiles: [],
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

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

  // File type icons mapping
  const fileTypeIcons = {
    PDF: <FileOutlined style={{ color: themeConstants.colors.error }} />,
    DOCX: <FileOutlined style={{ color: themeConstants.colors.primary[600] }} />,
    EXCEL: <FileOutlined style={{ color: themeConstants.colors.success }} />,
    POWERPOINT: <FileOutlined style={{ color: themeConstants.colors.error }} />,
    ZIP: <FileOutlined style={{ color: themeConstants.colors.info }} />,
    TEXT: <FileOutlined style={{ color: themeConstants.colors.neutral[500] }} />,
    FILE: <FileOutlined style={{ color: themeConstants.colors.neutral[500] }} />,
  };

  // Activity type icons mapping
  const activityTypeIcons = {
    upload: <UploadOutlined style={{ color: themeConstants.colors.success }} />,
    share: <UserOutlined style={{ color: themeConstants.colors.info }} />,
    edit: <EyeOutlined style={{ color: themeConstants.colors.warning }} />,
    delete: <ExclamationCircleOutlined style={{ color: themeConstants.colors.error }} />,
    folder: <FolderOutlined style={{ color: themeConstants.colors.primary[600] }} />,
  };

  // Recent files table columns
  const fileColumns = [
    {
      title: 'File',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          {fileTypeIcons[record.type as keyof typeof fileTypeIcons] || <FileOutlined />}
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => <Text>{size}</Text>,
    },
    {
      title: 'Modified',
      dataIndex: 'modified',
      key: 'modified',
      render: (modified: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: themeConstants.colors.text.tertiary }} />
          <Text type="secondary">{formatTimeAgo(modified)}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={status === 'active' ? 'Active' : 'Archived'}
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
            <Button type="text" icon={<DownloadOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="More">
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: themeConstants.spacing.xl }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Text type="secondary">
          Welcome back, {user?.username}! Here's what's happening with your files today.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: themeConstants.spacing.xl }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Files"
              value={data.totalFiles}
              prefix={<FileOutlined />}
              valueStyle={{ color: themeConstants.colors.primary[600] }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Storage Used"
              value={data.storageUsed}
              prefix={<CloudOutlined />}
              valueStyle={{ color: themeConstants.colors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active User"
              value={user?.username || 'Unknown'}
              prefix={<UserOutlined />}
              valueStyle={{ color: themeConstants.colors.info }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Folders"
              value={0}
              prefix={<FolderOutlined />}
              valueStyle={{ color: themeConstants.colors.warning }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Recent Files */}
        <Col xs={24} lg={16}>
          <Card
            title="Recent Files"
            extra={
              <Button type="primary" icon={<UploadOutlined />}>
                Upload File
              </Button>
            }
            style={{ height: '100%' }}
          >
            {data.recentFiles.length > 0 ? (
              <Table
                columns={fileColumns}
                dataSource={data.recentFiles}
                pagination={false}
                size="small"
                rowKey="id"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FileOutlined style={{ fontSize: 48, color: themeConstants.colors.text.tertiary }} />
                <div style={{ marginTop: 16, color: themeConstants.colors.text.secondary }}>
                  No files uploaded yet
                </div>
                <Button type="primary" style={{ marginTop: 16 }}>
                  Upload your first file
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Storage Overview */}
        <Col xs={24} lg={8}>
          <Card title="Storage Overview" style={{ height: '100%' }}>
            <div style={{ marginBottom: themeConstants.spacing.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: themeConstants.spacing.sm }}>
                <Text>Total Storage</Text>
                <Text strong>{data.storageUsed} / 10 GB</Text>
              </div>
              <Progress
                percent={Math.min((data.totalFiles / 100) * 100, 100)}
                strokeColor={themeConstants.colors.primary[600]}
                showInfo={false}
              />
            </div>

            <div>
              <Text strong style={{ marginBottom: themeConstants.spacing.md, display: 'block' }}>
                File Types
              </Text>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">File type breakdown will be shown here</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row style={{ marginTop: themeConstants.spacing.xl }}>
        <Col span={24}>
          <Card title="Recent Activity">
            {data.recentActivity.length > 0 ? (
              <List
                dataSource={data.recentActivity}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={activityTypeIcons[item.type as keyof typeof activityTypeIcons]}
                          style={{ backgroundColor: themeConstants.colors.background.secondary }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{item.user}</Text>
                          <Text>{item.action}</Text>
                          <Text code>{item.file}</Text>
                        </Space>
                      }
                      description={
                        <Space>
                          <ClockCircleOutlined style={{ color: themeConstants.colors.text.tertiary }} />
                          <Text type="secondary">{item.time}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <ClockCircleOutlined style={{ fontSize: 48, color: themeConstants.colors.text.tertiary }} />
                <div style={{ marginTop: 16, color: themeConstants.colors.text.secondary }}>
                  No recent activity
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row style={{ marginTop: themeConstants.spacing.xl }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  block
                  size="large"
                >
                  Upload Files
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<FolderOutlined />}
                  block
                  size="large"
                >
                  Create Folder
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<UserOutlined />}
                  block
                  size="large"
                >
                  Share Files
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button
                  icon={<DownloadOutlined />}
                  block
                  size="large"
                >
                  Download All
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;