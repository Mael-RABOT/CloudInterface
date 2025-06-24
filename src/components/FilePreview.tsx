import React from 'react';
import { Modal, Button, Typography, theme } from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Image } from 'antd';
import type { Item } from '../services/api';
import { useDeviceDetection } from '../utils/deviceDetection';

const { Text: TypographyText } = Typography;

interface FilePreviewProps {
  // Image preview
  previewVisible: boolean;
  previewImage: string;
  previewTitle: string;
  previewLoading: boolean;

  // PDF preview
  pdfPreviewVisible: boolean;
  pdfPreviewUrl: string;
  pdfPreviewTitle: string;

  // Unsupported file
  unsupportedFileModalVisible: boolean;
  unsupportedFileItem: Item | null;

  // Handlers
  onCloseImagePreview: () => void;
  onClosePdfPreview: () => void;
  onCloseUnsupportedFile: () => void;
  onDownload: (file: Item) => void;

  // Helper function
  getOriginalFilename: (filename: string) => string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  previewVisible,
  previewImage,
  previewTitle,
  previewLoading,
  pdfPreviewVisible,
  pdfPreviewUrl,
  pdfPreviewTitle,
  unsupportedFileModalVisible,
  unsupportedFileItem,
  onCloseImagePreview,
  onClosePdfPreview,
  onCloseUnsupportedFile,
  onDownload,
  getOriginalFilename
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
            fontFamily: token.fontFamily,
            color: token.colorPrimary,
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <EyeOutlined />
            {previewTitle}
          </div>
        }
        footer={null}
        onCancel={onCloseImagePreview}
        closeIcon={
          <div style={{
            color: '#52c41a',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            ✕
          </div>
        }
        width={isMobile ? '95vw' : 800}
        style={{
          fontFamily: token.fontFamily,
          top: isMobile ? 20 : 100
        }}
        styles={{
          body: {
            padding: isMobile ? '12px' : '24px',
            maxHeight: isMobile ? '70vh' : '80vh',
            overflow: 'auto'
          },
          header: {
            padding: isMobile ? '12px 16px' : '16px 24px'
          }
        }}
      >
        {previewLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: isMobile ? '300px' : '400px',
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius
          }}>
            <div style={{
              textAlign: 'center',
              color: token.colorTextSecondary,
              fontFamily: token.fontFamily
            }}>
              <div style={{
                fontSize: isMobile ? '20px' : '24px',
                marginBottom: token.marginSM,
                color: token.colorPrimary
              }}>
                <LoadingOutlined />
              </div>
              <TypographyText style={{ fontSize: isMobile ? '12px' : '14px' }}>
                LOADING PREVIEW...
              </TypographyText>
            </div>
          </div>
        ) : (
          <Image
            alt={previewTitle}
            style={{
              width: '100%',
              maxHeight: isMobile ? '60vh' : '70vh',
              objectFit: 'contain'
            }}
            src={previewImage}
            preview={false}
            onLoad={() => {
              // Clean up the blob URL when image loads
              return () => {
                if (previewImage) {
                  window.URL.revokeObjectURL(previewImage);
                }
              };
            }}
          />
        )}
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        open={pdfPreviewVisible}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
            fontFamily: token.fontFamily,
            color: token.colorPrimary,
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <FileTextOutlined />
            {pdfPreviewTitle}
          </div>
        }
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => {
              const a = document.createElement('a');
              a.href = pdfPreviewUrl;
              a.download = pdfPreviewTitle;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            size={isMobile ? "small" : "middle"}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText,
              minHeight: isMobile ? '36px' : 'auto'
            }}
          >
            {isMobile ? 'DOWNLOAD' : 'DOWNLOAD'}
          </Button>
        ]}
        onCancel={onClosePdfPreview}
        closeIcon={
          <div style={{
            color: '#52c41a',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            ✕
          </div>
        }
        width={isMobile ? '95vw' : 1000}
        style={{
          fontFamily: token.fontFamily,
          top: isMobile ? 20 : 100
        }}
        styles={{
          body: {
            padding: isMobile ? '12px' : '24px',
            maxHeight: isMobile ? '70vh' : '80vh',
            overflow: 'auto'
          },
          header: {
            padding: isMobile ? '12px 16px' : '16px 24px'
          }
        }}
      >
        {previewLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: isMobile ? '50vh' : '70vh',
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius
          }}>
            <div style={{
              textAlign: 'center',
              color: token.colorTextSecondary,
              fontFamily: token.fontFamily
            }}>
              <div style={{
                fontSize: isMobile ? '20px' : '24px',
                marginBottom: token.marginSM,
                color: token.colorPrimary
              }}>
                <LoadingOutlined />
              </div>
              <TypographyText style={{ fontSize: isMobile ? '12px' : '14px' }}>
                LOADING PDF...
              </TypographyText>
            </div>
          </div>
        ) : (
          <iframe
            src={pdfPreviewUrl}
            style={{
              width: '100%',
              height: isMobile ? '50vh' : '70vh',
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius
            }}
            title={pdfPreviewTitle}
          />
        )}
      </Modal>

      {/* Unsupported File Modal */}
      <Modal
        open={unsupportedFileModalVisible}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
            fontFamily: token.fontFamily,
            color: token.colorError,
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <FileTextOutlined />
            UNSUPPORTED FILE TYPE
          </div>
        }
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (unsupportedFileItem) {
                onDownload(unsupportedFileItem);
              }
            }}
            size={isMobile ? "small" : "middle"}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText,
              minHeight: isMobile ? '36px' : 'auto'
            }}
          >
            {isMobile ? 'DOWNLOAD' : 'DOWNLOAD'}
          </Button>
        ]}
        onCancel={onCloseUnsupportedFile}
        closeIcon={
          <div style={{
            color: '#52c41a',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            ✕
          </div>
        }
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
            <FileTextOutlined />
          </div>
          <TypographyText style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'bold',
            color: token.colorError,
            display: 'block',
            marginBottom: token.marginMD
          }}>
            PREVIEW NOT AVAILABLE
          </TypographyText>
          <TypographyText style={{
            fontSize: isMobile ? '14px' : '16px',
            display: 'block',
            marginBottom: token.marginSM
          }}>
            File: {unsupportedFileItem ? getOriginalFilename(unsupportedFileItem.filename) : 'Unknown'}
          </TypographyText>
          <TypographyText style={{
            fontSize: isMobile ? '12px' : '14px',
            color: token.colorTextTertiary
          }}>
            Type: {unsupportedFileItem?.contentType || 'Unknown'}
          </TypographyText>
          <div style={{
            marginTop: token.marginLG,
            padding: token.paddingMD,
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius
          }}>
            <TypographyText style={{
              fontSize: isMobile ? '12px' : '14px',
              color: token.colorTextSecondary
            }}>
              This file type cannot be previewed in the browser.
              <br />
              You can download the file to view it with an appropriate application.
            </TypographyText>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FilePreview;