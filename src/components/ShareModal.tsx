import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { theme } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import { useDeviceDetection } from '../utils/deviceDetection';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  sharedUrl: string;
  filename: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  sharedUrl,
  filename
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useDeviceDetection();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      onClose();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: token.marginSM,
          fontFamily: token.fontFamily,
          color: token.colorSuccess,
          fontWeight: 'bold',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          <ShareAltOutlined />
          FILE SHARED SUCCESSFULLY
        </div>
      }
      open={visible}
      onCancel={onClose}
      closeIcon={
        <div style={{
          color: '#52c41a',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          ✕
        </div>
      }
      footer={[
        <Button
          key="close"
          danger
          onClick={onClose}
          size={isMobile ? "large" : "middle"}
          style={{
            fontFamily: token.fontFamily,
            backgroundColor: token.colorBgContainer,
            minHeight: isMobile ? '48px' : 'auto'
          }}
        >
          CLOSE
        </Button>,
        <Button
          key="copy"
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
      ]}
      width={isMobile ? '95vw' : 700}
      style={{
        fontFamily: token.fontFamily,
        top: isMobile ? 20 : 100
      }}
      styles={{
        body: {
          padding: isMobile ? '20px' : '32px',
          minHeight: isMobile ? 'auto' : '300px'
        },
        header: {
          padding: isMobile ? '16px 20px' : '20px 32px'
        }
      }}
    >
      <div style={{
        textAlign: 'center',
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        minHeight: isMobile ? 'auto' : '200px'
      }}>
        <div style={{
          fontSize: isMobile ? '56px' : '72px',
          marginBottom: isMobile ? token.marginMD : token.marginLG,
          color: token.colorSuccess
        }}>
          <ShareAltOutlined />
        </div>
        <Typography.Text style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: 'bold',
          color: token.colorSuccess,
          display: 'block',
          marginBottom: isMobile ? token.marginSM : token.marginMD
        }}>
          FILE IS NOW SHARED!
        </Typography.Text>
        <Typography.Text style={{
          fontSize: isMobile ? '15px' : '16px',
          display: 'block',
          marginBottom: isMobile ? token.marginMD : token.marginLG
        }}>
          Share this link with anyone to give them access to "{filename}":
        </Typography.Text>
        <div style={{
          padding: isMobile ? token.paddingMD : token.paddingLG,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          marginBottom: isMobile ? token.marginMD : token.marginLG,
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          fontSize: isMobile ? '13px' : '14px',
          color: 'black',
          maxHeight: isMobile ? '120px' : '150px',
          overflow: 'auto'
        }}>
          {sharedUrl || 'No link available'}
        </div>
        <Typography.Text style={{
          fontSize: isMobile ? '13px' : '14px',
          color: token.colorTextTertiary
        }}>
          Anyone with this link can download the file. You can unshare it later by sharing the file again.
        </Typography.Text>
      </div>
    </Modal>
  );
};

export default ShareModal;