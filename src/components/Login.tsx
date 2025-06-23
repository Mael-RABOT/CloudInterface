import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  message,
  Typography,
  Divider,
  Space,
  Row,
  Col,
  Layout,
  theme
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  DesktopOutlined,
  KeyOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const REGISTER_DISABLED = true;

const { Text, Title } = Typography;
const { Header, Content } = Layout;

// Enhanced ASCII Art Logo with animation
const ASCII_LOGO = `
╔════════════════════════════════════════════════════╗
║                                                    ║
║      ██████╗██╗      ██████╗ ██╗   ██╗██████╗      ║
║     ██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗     ║
║     ██║     ██║     ██║   ██║██║   ██║██║  ██║     ║
║     ██║     ██║     ██║   ██║██║   ██║██║  ██║     ║
║     ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝     ║
║      ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝      ║
║                                                    ║
║          INTERFACE v2.0 - TERMINAL ACCESS          ║
║                SECURE AUTHENTICATION               ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      login(response.token, response.user);
      message.success({
        content: 'ACCESS GRANTED - Welcome to the system!',
        icon: <SecurityScanOutlined />,
        style: {
          background: token.colorBgElevated,
          border: `1px solid ${token.colorPrimary}`,
          color: token.colorPrimary,
          fontFamily: token.fontFamily
        }
      });
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      message.error({
        content: error.response?.data?.message || 'ACCESS DENIED - Invalid credentials',
        icon: <KeyOutlined />,
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

  const onRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await authAPI.register(values.username, values.email, values.password);
      message.success({
        content: 'REGISTRATION SUCCESSFUL - Please login to continue',
        icon: <SecurityScanOutlined />,
        style: {
          background: token.colorBgElevated,
          border: `1px solid ${token.colorSuccess}`,
          color: token.colorSuccess,
          fontFamily: token.fontFamily
        }
      });
      setActiveTab('login');
    } catch (error: any) {
      message.error({
        content: error.response?.data?.error || 'REGISTRATION FAILED - Please try again',
        icon: <KeyOutlined />,
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

  const items = [
    {
      key: 'login',
      label: (
        <Space>
          <LoginOutlined />
          <Text style={{ color: token.colorText, fontFamily: token.fontFamily }}>
            LOGIN
          </Text>
        </Space>
      ),
      children: (
        <Form
          name="login"
          onFinish={onLogin}
          autoComplete="off"
          layout="vertical"
          size="large"
          style={{ marginTop: token.marginLG }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Username required!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="ENTER USERNAME"
              size="large"
              style={{
                fontFamily: token.fontFamily,
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password required!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="ENTER PASSWORD"
              size="large"
              style={{
                fontFamily: token.fontFamily,
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: token.marginXL }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              icon={<LoginOutlined />}
              style={{
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                height: token.controlHeightLG,
                fontSize: token.fontSizeLG,
                boxShadow: token.boxShadow
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    ...(REGISTER_DISABLED ? [] : [{
      key: 'register',
      label: (
        <Space>
          <UserOutlined />
          <Text style={{ color: token.colorText, fontFamily: token.fontFamily }}>
            REGISTER
          </Text>
        </Space>
      ),
      children: (
        <Form
          name="register"
          onFinish={onRegister}
          autoComplete="off"
          layout="vertical"
          size="large"
          style={{ marginTop: token.marginLG }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Username required!' },
              { min: 3, message: 'Username must be at least 3 characters!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="ENTER USERNAME"
              size="large"
              style={{
                fontFamily: token.fontFamily,
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email required!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="ENTER EMAIL"
              size="large"
              style={{
                fontFamily: token.fontFamily,
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Password required!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="ENTER PASSWORD"
              size="large"
              style={{
                fontFamily: token.fontFamily,
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: token.marginXL }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              icon={<UserOutlined />}
              style={{
                fontFamily: token.fontFamily,
                fontWeight: 'bold',
                height: token.controlHeightLG,
                fontSize: token.fontSizeLG,
                boxShadow: token.boxShadow
              }}
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </Button>
          </Form.Item>
        </Form>
      ),
    }]),
  ];

  return (
    <Layout style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #001100 50%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div className="login-background-effects">
        <div className="scanlines"></div>
        <div className="glow-particles"></div>
      </div>

      <Content style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: token.paddingXL,
        position: 'relative',
        zIndex: 1
      }}>
        <Row justify="center" align="middle" style={{ width: '100%', maxWidth: '1200px' }}>
          <Col xs={24} lg={12} style={{ textAlign: 'center', marginBottom: token.marginXL }}>
            <div className="ascii-logo-container">
              <pre className="ascii-logo" style={{
                fontFamily: token.fontFamily,
                fontSize: '12px',
                lineHeight: 1.2,
                color: token.colorPrimary,
                margin: 0,
                whiteSpace: 'pre'
              }}>
                {ASCII_LOGO}
              </pre>
            </div>

            <Space direction="vertical" size="large" style={{ marginTop: token.marginXL }}>
              <Title level={2} style={{
                color: token.colorPrimary,
                fontFamily: token.fontFamily,
                margin: 0,
                fontWeight: 'bold'
              }}>
                <DesktopOutlined style={{ marginRight: token.marginSM }} />
                TERMINAL ACCESS
              </Title>

              <Text style={{
                color: token.colorTextSecondary,
                fontFamily: token.fontFamily,
                fontSize: token.fontSizeLG,
                display: 'block'
              }}>
                Secure cloud interface for advanced file management
              </Text>
            </Space>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              className="login-card"
              style={{
                background: token.colorBgElevated,
                border: `2px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                boxShadow: `0 0 30px ${token.colorPrimary}40`,
                backdropFilter: 'blur(10px)',
                maxWidth: '500px',
                margin: '0 auto'
              }}
              bodyStyle={{ padding: token.paddingXL }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                centered
                size="large"
                style={{
                  fontFamily: token.fontFamily
                }}
                tabBarStyle={{
                  marginBottom: token.marginLG,
                  borderBottom: `1px solid ${token.colorBorder}`
                }}
              />

              <Divider style={{
                borderColor: token.colorBorder,
                margin: `${token.marginLG}px 0`
              }}>
                <Text style={{
                  color: token.colorTextSecondary,
                  fontFamily: token.fontFamily,
                  fontSize: token.fontSizeSM
                }}>
                  SECURE CONNECTION
                </Text>
              </Divider>

              <div style={{ textAlign: 'center' }}>
                <Space direction="vertical" size="small">
                  <Text style={{
                    color: token.colorTextTertiary,
                    fontFamily: token.fontFamily,
                    fontSize: token.fontSizeSM
                  }}>
                    <SecurityScanOutlined style={{ marginRight: token.marginXS }} />
                    ENCRYPTED TRANSMISSION
                  </Text>
                  <Text style={{
                    color: token.colorTextTertiary,
                    fontFamily: token.fontFamily,
                    fontSize: token.fontSizeSM
                  }}>
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Login;