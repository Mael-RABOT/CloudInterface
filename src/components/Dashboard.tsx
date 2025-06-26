import React, { useState, useEffect } from 'react';
import { Layout, Typography, theme, Button, message, Drawer } from 'antd';
import {
  FileTextOutlined,
  LogoutOutlined,
  HomeOutlined,
  UploadOutlined,
  DeleteOutlined,
  MenuOutlined,
  PlusOutlined,
  ShareAltOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import type { Item } from '../services/api';
import type { Key } from 'antd/es/table/interface';
import FilePreview from './FilePreview';
import { useDeviceDetection } from '../utils/deviceDetection';
import ConfirmationModal from './ConfirmationModal';
import ShareModal from './ShareModal';
import UploadModal from './UploadModal';
import FileGrid from './FileGrid';
import CustomTree from './CustomTree';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const { logout, user } = useAuth();
  const { isMobile, isSmallMobile } = useDeviceDetection();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [files, setFiles] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [folderTree, setFolderTree] = useState<any[]>([]);

  // Mobile navigation state
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Bulk delete state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalVisible, setBulkDeleteModalVisible] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const [currentDeletingFile, setCurrentDeletingFile] = useState('');

  // Upload state
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState('');

  // Preview state variables
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState('');
  const [unsupportedFileModalVisible, setUnsupportedFileModalVisible] = useState(false);
  const [unsupportedFileItem, setUnsupportedFileItem] = useState<Item | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Share state variables
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareConfirmModalVisible, setShareConfirmModalVisible] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharedUrl, setSharedUrl] = useState('');
  const [fileToShare, setFileToShare] = useState<Item | null>(null);
  const [isFileAlreadyShared, setIsFileAlreadyShared] = useState(false);

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
    // Check if it's a text file that should open in edit mode
    const isTextFile = file.contentType.startsWith('text/') ||
                      file.contentType === 'application/json' ||
                      file.contentType === 'application/xml' ||
                      file.filename.endsWith('.txt') ||
                      file.filename.endsWith('.json') ||
                      file.filename.endsWith('.xml') ||
                      file.filename.endsWith('.md');

    if (isTextFile) {
      // Navigate to the edit page for text files
      navigate(`/item/${file.id}`);
      return;
    }

    setPreviewLoading(true);

    // Handle other file types with preview modals
    if (file.contentType.startsWith('image/')) {
      setPreviewTitle(getOriginalFilename(file.filename));
      setPreviewVisible(true);
    } else if (file.contentType === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf')) {
      setPdfPreviewTitle(getOriginalFilename(file.filename));
      setPdfPreviewVisible(true);
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
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      message.error(`Failed to preview ${file.filename}: ${error.message || 'Unknown error'}`);
      // Close the modal on error
      setPreviewVisible(false);
      setPdfPreviewVisible(false);
      setPreviewImage('');
      setPdfPreviewUrl('');
      setPreviewTitle('');
      setPdfPreviewTitle('');
    } finally {
      setPreviewLoading(false);
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

  // Share handlers
  const handleShare = (file: Item) => {
    setFileToShare(file);

    // Check if file is already shared using the isShared field from the API response
    if (file.isShared) {
      // File is already shared, show warning about destroying existing link
      setIsFileAlreadyShared(true);
      setShareConfirmModalVisible(true);
    } else {
      // File is not shared, proceed with normal sharing
      setIsFileAlreadyShared(false);
      setShareConfirmModalVisible(true);
    }
  };

  const getSharedUrl = (fileId: number): string => {
    //const sharedUrlResponse = await itemsAPI.getSharedUrl(fileId);
    return `http://cloud.api.maelrabot.com/api/items/${fileId}/shared`;
  };

  const handleShareConfirm = async () => {
    if (!fileToShare) return;

    try {
      setShareLoading(true);
      setShareConfirmModalVisible(false);

      // First toggle sharing
      await itemsAPI.toggleShared(fileToShare.id);

      if (!isFileAlreadyShared) {
        setSharedUrl(getSharedUrl(fileToShare.id));
        setShareModalVisible(true);
      }

      message.success(`File "${getOriginalFilename(fileToShare.filename)}" ${isFileAlreadyShared ? 'sharing has been disabled' : 'is now shared'}!`);

      // Reload files to get updated isShared status
      loadFiles();
    } catch (error: any) {
      console.error('Share failed:', error);
      message.error(`Failed to share ${getOriginalFilename(fileToShare.filename)}: ${error.message || 'Unknown error'}`);
    } finally {
      setShareLoading(false);
    }
  };

  const handleShareModalClose = () => {
    setShareModalVisible(false);
    setSharedUrl('');
    setFileToShare(null);
    setIsFileAlreadyShared(false);
  };

  const handleShareConfirmModalClose = () => {
    setShareConfirmModalVisible(false);
    setFileToShare(null);
    setIsFileAlreadyShared(false);
  };

  const copyToClipboard = async () => {
    if (!fileToShare) return;

    try {
      const sharedUrl = getSharedUrl(fileToShare.id);
      await navigator.clipboard.writeText(sharedUrl);
      message.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      message.error('Failed to copy link to clipboard');
    }
  };

  // Upload handlers
  const handleUpload = async (values: any, selectedFiles: File[]) => {
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

        // Close modal and reload files after upload is complete
        setUploadModalVisible(false);
        setUploadProgress(0);
        setCurrentUploadFile('');
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

  // Handle upload modal close with cleanup
  const handleUploadModalClose = () => {
    setUploadModalVisible(false);
    setUploadProgress(0);
    setCurrentUploadFile('');
    setUploadLoading(false);
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
                  onClick={() => setUploadModalVisible(true)}
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
              backgroundColor: token.colorBgContainer
            }}>
              <FileGrid
                files={filteredFiles}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onShare={handleShare}
                loading={loading}
                selectedFileIds={selectedFileIds}
                onFileSelect={handleFileSelect}
                isMobile={isMobile}
              />
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
            onClick={() => setUploadModalVisible(true)}
            className="mobile-fab"
            size="large"
          />
        </div>
      )}

      {/* Modals */}
      <UploadModal
        visible={uploadModalVisible}
        onCancel={handleUploadModalClose}
        onSubmit={handleUpload}
        loading={uploadLoading}
        progress={uploadProgress}
        currentUploadFile={currentUploadFile}
        currentLocation={currentLocation}
      />

      <ConfirmationModal
        visible={bulkDeleteModalVisible}
        onCancel={() => setBulkDeleteModalVisible(false)}
        onConfirm={confirmBulkDelete}
        title="CONFIRM BULK DELETE"
        icon={<DeleteOutlined />}
        description={`You are about to permanently delete ${selectedFileIds.size} file${selectedFileIds.size !== 1 ? 's' : ''}.`}
        warning="WARNING: IRREVERSIBLE ACTION"
        confirmText={`DELETE ${selectedFileIds.size} FILE${selectedFileIds.size !== 1 ? 'S' : ''}`}
        loading={bulkDeleteLoading}
        loadingText="DELETING..."
        danger={true}
        progress={{
          percent: bulkDeleteProgress,
          currentItem: currentDeletingFile,
          totalItems: selectedFileIds.size
        }}
      />

      <ConfirmationModal
        visible={shareConfirmModalVisible}
        onCancel={handleShareConfirmModalClose}
        onConfirm={handleShareConfirm}
        title={isFileAlreadyShared ? 'WARNING: DISABLE SHARING' : 'CONFIRM SHARE'}
        icon={<ShareAltOutlined />}
        description={isFileAlreadyShared
          ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                You are about to disable the sharing of<br />
                <strong style={{ color: token.colorPrimary }}>
                  "{fileToShare ? getOriginalFilename(fileToShare.filename) : ''}"
                </strong>
              </div>
              <div style={{
                padding: '8px 12px',
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: token.colorTextSecondary,
                wordBreak: 'break-all'
              }}>
                URL: {getSharedUrl(fileToShare?.id || 0)}
              </div>
            </div>
          )
          : (
            <div>
              You are about to share<br />
              <strong style={{ color: token.colorPrimary }}>
                "{fileToShare ? getOriginalFilename(fileToShare.filename) : ''}"
              </strong>
            </div>
          )
        }
        confirmText={isFileAlreadyShared ? 'DISABLE SHARING' : 'SHARE FILE'}
        loading={shareLoading}
        loadingText="SHARING..."
        success={true}
        customAction={
          isFileAlreadyShared ? (
            <Button
              type="primary"
              onClick={copyToClipboard}
              size={isMobile ? "large" : "middle"}
              style={{
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                background: token.colorSuccess,
                borderColor: token.colorSuccess,
                minHeight: isMobile ? '48px' : 'auto'
              }}
            >
              COPY LINK
            </Button>
          ) : undefined
        }
      />

      <ShareModal
        visible={shareModalVisible}
        onClose={handleShareModalClose}
        sharedUrl={sharedUrl}
        filename={fileToShare ? getOriginalFilename(fileToShare.filename) : ''}
      />

      {/* File Preview Components */}
      <FilePreview
        previewVisible={previewVisible}
        previewImage={previewImage}
        previewTitle={previewTitle}
        previewLoading={previewLoading}
        pdfPreviewVisible={pdfPreviewVisible}
        pdfPreviewUrl={pdfPreviewUrl}
        pdfPreviewTitle={pdfPreviewTitle}
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
        onCloseUnsupportedFile={() => {
          setUnsupportedFileModalVisible(false);
          setUnsupportedFileItem(null);
        }}
        onDownload={handleDownload}
        getOriginalFilename={getOriginalFilename}
      />
    </Layout>
  );
};

export default Dashboard;