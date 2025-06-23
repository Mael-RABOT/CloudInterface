import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Space,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CloudOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { themeConstants } from '../theme';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      await login(response.token, values.username);
      message.success('Welcome back! You have successfully logged in.');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${themeConstants.colors.primary[50]} 0%, ${themeConstants.colors.primary[100]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: themeConstants.spacing.lg,
      }}
    >
      <Row justify="center" align="middle" style={{ width: '100%', maxWidth: 1200 }}>
        <Col xs={24} lg={12} style={{ padding: themeConstants.spacing.lg }}>
          {/* Left side - Branding */}
          <div style={{ textAlign: 'center', marginBottom: themeConstants.spacing.xl }}>
            <Space direction="vertical" size="large">
              <div>
                <CloudOutlined
                  style={{
                    fontSize: 64,
                    color: themeConstants.colors.primary[600],
                    marginBottom: themeConstants.spacing.md,
                  }}
                />
                <Title level={1} style={{ margin: 0, color: themeConstants.colors.text.primary }}>
                  Cloud Interface
                </Title>
                <Title level={3} style={{ margin: 0, color: themeConstants.colors.text.secondary, fontWeight: 400 }}>
                  Professional File Management
                </Title>
              </div>

              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <Paragraph style={{ fontSize: 16, color: themeConstants.colors.text.secondary }}>
                  Secure, fast, and intuitive cloud storage solution for teams and individuals.
                  Access your files from anywhere, collaborate seamlessly, and stay organized.
                </Paragraph>
              </div>

              {/* Feature highlights */}
              <Row gutter={[24, 16]} justify="center">
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, color: themeConstants.colors.primary[600], marginBottom: 8 }}>
                      🔒
                    </div>
                    <Text strong>Secure</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, color: themeConstants.colors.success, marginBottom: 8 }}>
                      ⚡
                    </div>
                    <Text strong>Fast</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, color: themeConstants.colors.info, marginBottom: 8 }}>
                      🤝
                    </div>
                    <Text strong>Collaborative</Text>
                  </div>
                </Col>
              </Row>
            </Space>
          </div>
        </Col>

        <Col xs={24} lg={12} style={{ padding: themeConstants.spacing.lg }}>
          {/* Right side - Login Form */}
          <Card
            style={{
              maxWidth: 400,
              margin: '0 auto',
              borderRadius: themeConstants.borderRadius.lg,
              boxShadow: themeConstants.shadows.xl,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: themeConstants.spacing.xl }}>
              <Title level={2} style={{ margin: 0 }}>
                Sign In
              </Title>
              <Text type="secondary">
                Enter your credentials to access your account
              </Text>
            </div>

            <Form
              name="login"
              onFinish={onLogin}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Please enter your username' },
                  { min: 3, message: 'Username must be at least 3 characters' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: themeConstants.colors.text.tertiary }} />}
                  placeholder="Username"
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: themeConstants.colors.text.tertiary }} />}
                  placeholder="Password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ height: 48, fontSize: 16 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: themeConstants.spacing.lg }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Need an account? Please contact your administrator.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;