import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, message, theme } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { itemsAPI } from '../services/api';
import type { Item } from '../services/api';
import Editor from './Editor';
import { useDeviceDetection } from '../utils/deviceDetection';

const { Header, Content } = Layout;
const { Title } = Typography;

const ItemEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { isMobile } = useDeviceDetection();

  const [item, setItem] = useState<Item | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    const loadItem = async () => {
      if (!id) {
        message.error('No item ID provided');
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);

        // Get the item details
        const items = await itemsAPI.getMyItems();
        const foundItem = items.find(item => item.id === parseInt(id));

        if (!foundItem) {
          message.error('Item not found');
          navigate('/dashboard');
          return;
        }

        setItem(foundItem);

        // Check if it's a text file that can be edited
        const isTextFile = foundItem.contentType.startsWith('text/') ||
                          foundItem.contentType === 'application/json' ||
                          foundItem.contentType === 'application/xml' ||
                          foundItem.filename.endsWith('.txt') ||
                          foundItem.filename.endsWith('.json') ||
                          foundItem.filename.endsWith('.xml') ||
                          foundItem.filename.endsWith('.md');

        if (!isTextFile) {
          message.error('This file type cannot be edited');
          navigate('/dashboard');
          return;
        }

        // Download and load the file content
        const blob = await itemsAPI.downloadFile(foundItem.id);
        const textContent = await blob.text();
        setContent(textContent);

      } catch (error) {
        console.error('Failed to load item:', error);
        message.error('Failed to load item');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id, navigate]);

  const handleSave = async (newContent: string, filename: string, fileId?: number) => {
    if (!item && !fileId) return;

    try {
      await itemsAPI.updateFile(fileId || item!.id, newContent, filename);
      message.success('File saved successfully');
      setContent(newContent);
    } catch (error) {
      console.error('Failed to save file:', error);
      message.error('Failed to save file');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#000' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: token.colorPrimary,
          fontFamily: token.fontFamily
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: token.marginSM }}>
              LOADING...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <Header style={{
        background: '#001100',
        borderBottom: `2px solid ${token.colorBorder}`,
        padding: isMobile ? '0 16px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? '60px' : '72px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: token.marginMD
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{
              color: token.colorPrimary,
              fontSize: isMobile ? '16px' : '18px',
              height: isMobile ? '40px' : '44px',
              width: isMobile ? '40px' : '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 255, 0, 0.1)',
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius
            }}
          />
          <Title level={isMobile ? 4 : 3} style={{
            margin: 0,
            color: token.colorPrimary,
            fontFamily: token.fontFamily,
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '20px'
          }}>
            EDIT: {getOriginalFilename(item.filename)}
          </Title>
        </div>
      </Header>

      {/* Content */}
      <Content style={{
        padding: isMobile ? '16px' : '24px',
        height: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <Editor
          content={content}
          filename={getOriginalFilename(item.filename)}
          fileId={item.id}
          onSave={handleSave}
          readOnly={false}
          style={{
            flex: 1,
            minHeight: 0,
            fontFamily: token.fontFamily
          }}
        />
      </Content>
    </Layout>
  );
};

export default ItemEdit;