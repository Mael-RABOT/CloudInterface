import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const REGISTER_DISABLED = true

const { Text } = Typography;

// ASCII Art Logo
const ASCII_LOGO = `
╔════════════════════════════════════════════╗
║                                            ║
║  ██████╗██╗      ██████╗ ██╗   ██╗██████╗  ║
║ ██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗ ║
║ ██║     ██║     ██║   ██║██║   ██║██║  ██║ ║
║ ██║     ██║     ██║   ██║██║   ██║██║  ██║ ║
║ ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝ ║
║  ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝  ║
║                                            ║
║               INTERFACE v2.0               ║
║              TERMINAL ACCESS               ║
║                                            ║
╚════════════════════════════════════════════╝
`;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      login(response.token, response.user);
      message.success('ACCESS GRANTED - Welcome to the system!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ACCESS DENIED - Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await authAPI.register(values.username, values.email, values.password);
      message.success('REGISTRATION SUCCESSFUL - Please login to continue');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'REGISTRATION FAILED - Please try again');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'login',
      label: 'LOGIN',
      children: (
        <Form
          name="login"
          onFinish={onLogin}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Username required!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="ENTER USERNAME"
              className="retro-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password required!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="ENTER PASSWORD"
              className="retro-input"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              className="retro-button"
              icon={<LoginOutlined />}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    ...(REGISTER_DISABLED ? [] : [{
      key: 'register',
      label: 'REGISTER',
      children: (
        <Form
          name="register"
          onFinish={onRegister}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Username required!' },
              { min: 3, message: 'Username must be at least 3 characters!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="ENTER USERNAME"
              className="retro-input"
              size="large"
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
              prefix={<MailOutlined />}
              placeholder="ENTER EMAIL"
              className="retro-input"
              size="large"
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
              prefix={<LockOutlined />}
              placeholder="ENTER PASSWORD"
              className="retro-input"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              className="retro-button"
              icon={<LoginOutlined />}
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </Button>
          </Form.Item>
        </Form>
      ),
    }]),
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      height: '100vh',
      background: '#000',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* ASCII Logo */}
        <div className="ascii-header" style={{ marginBottom: '30px' }}>
          {ASCII_LOGO}
        </div>

        {/* Login Card */}
        <Card className="retro-card" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Text className="terminal-text" style={{ fontSize: '18px' }}>
              SYSTEM ACCESS TERMINAL
            </Text>
          </div>

          {!REGISTER_DISABLED && (
            <Divider style={{ borderColor: '#00ff00', margin: '20px 0' }}>
              <Text className="terminal-text">SELECT OPERATION</Text>
            </Divider>
          )}

          <Tabs
            defaultActiveKey="login"
            centered
            items={items}
            className="retro-tabs"
            size="large"
          />

          <Divider style={{ borderColor: '#00ff00', margin: '20px 0' }}>
            <Text className="terminal-text" style={{ fontSize: '12px' }}>
              SECURE CONNECTION ESTABLISHED
            </Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text className="terminal-text" style={{ fontSize: '12px', opacity: 0.7 }}>
              CLOUD INTERFACE v2.0 | TERMINAL ACCESS | {new Date().getFullYear()}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;