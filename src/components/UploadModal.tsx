import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Progress, Button, Typography, Tooltip } from 'antd';
import { theme } from 'antd';
import { UploadOutlined, InboxOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useDeviceDetection } from '../utils/deviceDetection';

const { Text } = Typography;
const { Dragger } = Upload;

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any, files: File[]) => void;
  loading: boolean;
  progress: number;
  currentUploadFile: string;
  currentLocation: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  progress,
  currentUploadFile,
  currentLocation
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useDeviceDetection();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadForm] = Form.useForm();

  // Reset form and selected files when modal is closed
  useEffect(() => {
    if (!visible) {
      setSelectedFiles([]);
      uploadForm.resetFields();
      uploadForm.setFieldsValue({ location: currentLocation });
    }
  }, [visible, uploadForm, currentLocation]);

  const handleSubmit = (values: any) => {
    if (selectedFiles.length === 0) {
      return;
    }
    onSubmit(values, selectedFiles);
  };

  const handleCancel = () => {
    onCancel();
  };

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

  return (
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
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? '95vw' : 800}
      style={{
        fontFamily: token.fontFamily,
        top: isMobile ? 20 : 100
      }}
      closeIcon={
        <div style={{
          color: '#52c41a',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          ✕
        </div>
      }
      styles={{
        body: {
          padding: isMobile ? '20px' : '32px',
          maxHeight: isMobile ? '75vh' : '85vh',
          overflow: 'auto'
        },
        header: {
          padding: isMobile ? '16px 20px' : '20px 32px'
        }
      }}
    >
      <Form
        form={uploadForm}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ location: currentLocation }}
        style={{ height: '100%' }}
      >
        <Form.Item
          name="location"
          label={
            <Text style={{
              color: token.colorPrimary,
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              fontSize: isMobile ? '15px' : '16px'
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
              fontSize: isMobile ? '15px' : '16px'
            }}>
              SELECT FILES
            </Text>
          }
          required
          style={{ border: 'none' }}
        >
          <Dragger
            beforeUpload={(file) => {
              setSelectedFiles(prev => [...prev, file]);
              return false;
            }}
            showUploadList={false}
            accept="*/*"
            multiple
            disabled={loading}
            style={{
              padding: isMobile ? '28px 20px' : '36px 28px'
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{
                fontSize: isMobile ? '40px' : '52px',
                color: token.colorPrimary
              }} />
            </p>
            <p className="ant-upload-text" style={{
              color: token.colorText,
              fontFamily: token.fontFamily,
              fontSize: isMobile ? '17px' : token.fontSizeLG,
              fontWeight: 'bold',
              margin: isMobile ? '10px 0' : '14px 0'
            }}>
              {isMobile ? 'Tap to select files' : 'Click or drag files to this area to upload'}
            </p>
            <p className="ant-upload-hint" style={{
              color: token.colorTextSecondary,
              fontFamily: token.fontFamily,
              fontSize: isMobile ? '13px' : token.fontSizeSM
            }}>
              {isMobile ? 'Support for multiple file uploads' : 'Support for multiple file uploads. Files will be uploaded to the selected location.'}
            </p>
          </Dragger>

          {selectedFiles.length > 0 && (
            <div style={{
              marginTop: token.marginMD,
              padding: isMobile ? token.paddingMD : token.paddingLG,
              background: token.colorBgElevated,
              border: `1px solid ${token.colorSuccess}`,
              borderRadius: token.borderRadius
            }}>
              <div style={{
                fontFamily: token.fontFamily,
                color: token.colorSuccess,
                fontWeight: 'bold',
                marginBottom: token.marginSM,
                fontSize: isMobile ? '15px' : '16px'
              }}>
                SELECTED FILES ({selectedFiles.length}):
              </div>
              {selectedFiles.map((file, index) => (
                <div key={index} style={{
                  fontSize: isMobile ? '13px' : token.fontSizeSM,
                  marginBottom: token.marginXS,
                  padding: isMobile ? `${token.paddingXS}px ${token.paddingMD}px` : `${token.paddingXS}px ${token.paddingLG}px`,
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
                    marginRight: isMobile ? '10px' : '14px'
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
                        padding: isMobile ? '6px' : '0 6px',
                        minWidth: isMobile ? '36px' : 'auto',
                        minHeight: isMobile ? '36px' : 'auto',
                        fontFamily: token.fontFamily
                      }}
                    />
                  </Tooltip>
                </div>
              ))}
              <div style={{
                fontSize: isMobile ? '13px' : token.fontSizeSM,
                marginTop: token.marginSM,
                padding: isMobile ? `${token.paddingXS}px ${token.paddingMD}px` : `${token.paddingXS}px ${token.paddingLG}px`,
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
                  minHeight: isMobile ? '36px' : 'auto'
                }}
              >
                CLEAR ALL
              </Button>
            </div>
          )}
        </Form.Item>

        {progress > 0 && (
          <Form.Item
            label={
              <Text style={{
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '16px'
              }}>
                UPLOAD PROGRESS
              </Text>
            }
          >
            {currentUploadFile && (
              <div style={{
                marginBottom: token.marginSM,
                fontSize: isMobile ? '13px' : token.fontSizeSM,
                fontFamily: token.fontFamily,
                color: token.colorTextSecondary
              }}>
                UPLOADING: {currentUploadFile}
              </div>
            )}
            <Progress
              percent={progress}
              status={progress === 100 ? 'success' : 'active'}
              strokeColor={token.colorPrimary}
              style={{
                fontFamily: token.fontFamily
              }}
              format={(percent) => `${percent}% (${Math.round((progress / 100) * selectedFiles.length)}/${selectedFiles.length} files)`}
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size={isMobile ? "large" : "middle"}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              width: '100%',
              height: isMobile ? '52px' : '44px',
              fontSize: isMobile ? '17px' : '15px'
            }}
            disabled={selectedFiles.length === 0}
          >
            {loading ? 'UPLOADING...' : `UPLOAD ${selectedFiles.length} FILE${selectedFiles.length !== 1 ? 'S' : ''}`}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadModal;