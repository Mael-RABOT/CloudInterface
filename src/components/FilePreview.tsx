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
import Editor from './Editor';

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

  // Text preview
  textPreviewVisible: boolean;
  textPreviewContent: string;
  textPreviewTitle: string;
  textPreviewFileId?: number;

  // Unsupported file
  unsupportedFileModalVisible: boolean;
  unsupportedFileItem: Item | null;

  // Handlers
  onCloseImagePreview: () => void;
  onClosePdfPreview: () => void;
  onCloseTextPreview: () => void;
  onCloseUnsupportedFile: () => void;
  onDownload: (file: Item) => void;
  onFileUpdated?: (fileId: number, content: string, filename: string) => void;

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
  textPreviewVisible,
  textPreviewContent,
  textPreviewTitle,
  textPreviewFileId,
  unsupportedFileModalVisible,
  unsupportedFileItem,
  onCloseImagePreview,
  onClosePdfPreview,
  onCloseTextPreview,
  onCloseUnsupportedFile,
  onDownload,
  onFileUpdated,
  getOriginalFilename
}) => {
  const { token } = theme.useToken();

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
            fontWeight: 'bold'
          }}>
            <EyeOutlined />
            {previewTitle}
          </div>
        }
        footer={null}
        onCancel={onCloseImagePreview}
        width={800}
        style={{
          fontFamily: token.fontFamily
        }}
      >
        {previewLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
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
                fontSize: '24px',
                marginBottom: token.marginSM,
                color: token.colorPrimary
              }}>
                <LoadingOutlined />
              </div>
              <TypographyText>LOADING PREVIEW...</TypographyText>
            </div>
          </div>
        ) : (
          <Image
            alt={previewTitle}
            style={{ width: '100%' }}
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
            fontWeight: 'bold'
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
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText
            }}
          >
            DOWNLOAD
          </Button>
        ]}
        onCancel={onClosePdfPreview}
        width={1000}
        style={{
          fontFamily: token.fontFamily
        }}
      >
        {previewLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
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
                fontSize: '24px',
                marginBottom: token.marginSM,
                color: token.colorPrimary
              }}>
                <LoadingOutlined />
              </div>
              <TypographyText>LOADING PDF...</TypographyText>
            </div>
          </div>
        ) : (
          <iframe
            src={pdfPreviewUrl}
            style={{
              width: '100%',
              height: '70vh',
              border: 'none'
            }}
            title={pdfPreviewTitle}
          />
        )}
      </Modal>

      {/* Text Preview Modal */}
      <Modal
        open={textPreviewVisible}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
            fontFamily: token.fontFamily,
            color: token.colorPrimary,
            fontWeight: 'bold'
          }}>
            <FileTextOutlined />
            {textPreviewTitle}
          </div>
        }
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => {
              const blob = new Blob([textPreviewContent], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = textPreviewTitle;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText
            }}
          >
            DOWNLOAD
          </Button>
        ]}
        onCancel={onCloseTextPreview}
        width={1200}
        style={{
          fontFamily: token.fontFamily
        }}
        styles={{
          body: {
            padding: 0,
            height: '80vh'
          }
        }}
      >
        {previewLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
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
                fontSize: '24px',
                marginBottom: token.marginSM,
                color: token.colorPrimary
              }}>
                <LoadingOutlined />
              </div>
              <TypographyText>LOADING TEXT...</TypographyText>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%' }}>
            <Editor
              initialContent={textPreviewContent}
              title={textPreviewTitle}
              readOnly={false}
              placeholder="Loading content..."
              autoFocus={false}
              onSave={(content, title) => {
                if (onFileUpdated && textPreviewFileId) {
                  onFileUpdated(textPreviewFileId, content, title);
                }
              }}
              onClose={onCloseTextPreview}
            />
          </div>
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
            color: token.colorWarning,
            fontWeight: 'bold'
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
              onCloseUnsupportedFile();
            }}
            style={{
              fontFamily: token.fontFamily,
              fontWeight: 'bold',
              background: token.colorBgContainer,
              borderColor: token.colorBorder,
              color: token.colorText
            }}
          >
            DOWNLOAD FILE
          </Button>
        ]}
        onCancel={onCloseUnsupportedFile}
        width={500}
        style={{
          fontFamily: token.fontFamily
        }}
      >
        <div style={{
          textAlign: 'center',
          padding: token.paddingLG
        }}>
          <FileTextOutlined style={{
            fontSize: '48px',
            color: token.colorWarning,
            marginBottom: token.marginMD
          }} />
          <TypographyText style={{
            display: 'block',
            marginBottom: token.marginSM,
            fontFamily: token.fontFamily,
            fontWeight: 'bold',
            color: token.colorText
          }}>
            {unsupportedFileItem ? getOriginalFilename(unsupportedFileItem.filename) : ''}
          </TypographyText>
          <TypographyText style={{
            color: token.colorTextSecondary,
            fontFamily: token.fontFamily,
            fontSize: token.fontSizeSM
          }}>
            This file type ({unsupportedFileItem?.contentType}) cannot be previewed in the browser.
            <br />
            You can download the file to view it with an appropriate application.
          </TypographyText>
        </div>
      </Modal>
    </>
  );
};

export default FilePreview;