import React from 'react';
import { Modal, Button, Typography, Progress } from 'antd';
import { theme } from 'antd';
import { useDeviceDetection } from '../utils/deviceDetection';

interface ConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  icon: React.ReactNode;
  description: string;
  warning?: string;
  confirmText: string;
  cancelText?: string;
  loading?: boolean;
  loadingText?: string;
  danger?: boolean;
  success?: boolean;
  progress?: {
    percent: number;
    currentItem?: string;
    totalItems?: number;
  };
  width?: number | string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title,
  icon,
  description,
  warning,
  confirmText,
  cancelText = 'CANCEL',
  loading = false,
  loadingText,
  danger = false,
  success = false,
  progress,
  width
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useDeviceDetection();

  const getIconColor = () => {
    if (danger) return token.colorError;
    if (success) return token.colorSuccess;
    return token.colorPrimary;
  };

  const getConfirmButtonStyle = () => {
    if (danger) {
      return {
        fontFamily: token.fontFamily,
        fontWeight: 'bold',
        minHeight: isMobile ? '48px' : 'auto'
      };
    }
    if (success) {
      return {
        fontFamily: token.fontFamily,
        fontWeight: 'bold',
        background: token.colorSuccess,
        borderColor: token.colorSuccess,
        minHeight: isMobile ? '48px' : 'auto'
      };
    }
    return {
      fontFamily: token.fontFamily,
      fontWeight: 'bold',
      minHeight: isMobile ? '48px' : 'auto'
    };
  };

  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: token.marginSM,
          fontFamily: token.fontFamily,
          color: getIconColor(),
          fontWeight: 'bold',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          {icon}
          {title}
        </div>
      }
      open={visible}
      onCancel={onCancel}
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
          key="cancel"
          onClick={onCancel}
          size={isMobile ? "large" : "middle"}
          style={{
            fontFamily: token.fontFamily,
            backgroundColor: token.colorBgContainer,
            minHeight: isMobile ? '48px' : 'auto',
          }}
        >
          {cancelText}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger={danger}
          loading={loading}
          onClick={onConfirm}
          size={isMobile ? "large" : "middle"}
          style={getConfirmButtonStyle()}
        >
          {loading ? (loadingText || 'PROCESSING...') : confirmText}
        </Button>
      ]}
      width={width || (isMobile ? '90vw' : 600)}
      style={{
        fontFamily: token.fontFamily,
        top: isMobile ? 20 : 100
      }}
      styles={{
        body: {
          padding: isMobile ? '20px' : '32px',
          minHeight: isMobile ? 'auto' : '280px'
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
        minHeight: isMobile ? 'auto' : '180px'
      }}>
        <div style={{
          fontSize: isMobile ? '56px' : '72px',
          marginBottom: isMobile ? token.marginMD : token.marginLG,
          color: getIconColor()
        }}>
          {icon}
        </div>

        {warning && (
          <Typography.Text style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 'bold',
            color: getIconColor(),
            display: 'block',
            marginBottom: isMobile ? token.marginSM : token.marginMD
          }}>
            {warning}
          </Typography.Text>
        )}

        <Typography.Text style={{
          fontSize: isMobile ? '15px' : '16px',
          display: 'block',
          marginBottom: isMobile ? token.marginSM : token.marginMD
        }}>
          {description}
        </Typography.Text>

        <Typography.Text style={{
          fontSize: isMobile ? '13px' : '14px',
          color: token.colorTextTertiary
        }}>
          {warning ? 'This action cannot be undone. All selected files will be permanently removed from the system.' : ''}
        </Typography.Text>

        {progress && (
          <div style={{
            marginTop: isMobile ? token.marginMD : token.marginLG,
            padding: isMobile ? token.paddingMD : token.paddingLG,
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius
          }}>
            {progress.currentItem && (
              <div style={{
                marginBottom: token.marginSM,
                fontSize: isMobile ? '13px' : token.fontSizeSM,
                fontFamily: token.fontFamily,
                color: token.colorTextSecondary
              }}>
                PROCESSING: {progress.currentItem}
              </div>
            )}
            <Progress
              percent={progress.percent}
              status={progress.percent === 100 ? 'success' : 'active'}
              strokeColor={getIconColor()}
              style={{
                fontFamily: token.fontFamily
              }}
              format={(percent) => {
                if (progress.totalItems) {
                  return `${percent}% (${Math.round((progress.percent / 100) * progress.totalItems)}/${progress.totalItems} items)`;
                }
                return `${percent}%`;
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmationModal;