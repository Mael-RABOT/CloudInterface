import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const REGISTER_DISABLED = true;

// Simplified ASCII Art Logo for mobile
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

const LoginMobile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      login(response.token, response.user);
      message.success('ACCESS GRANTED - Welcome to the system!');
      // Navigate to the intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.error || 'ACCESS DENIED - Invalid credentials');
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
              className="retro-input mobile-input"
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
              className="retro-input mobile-input"
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
              className="retro-button mobile-button"
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
              className="retro-input mobile-input"
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
              className="retro-input mobile-input"
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
              className="retro-input mobile-input"
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
              className="retro-button mobile-button"
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
    <div className="mobile-login-container">
      <div className="mobile-ascii-logo">
        <pre className="ascii-art">{ASCII_LOGO}</pre>
      </div>

      <Card className="mobile-login-card">
        <Tabs
          items={items}
          className="mobile-tabs"
          size="large"
          centered
        />
      </Card>
    </div>
  );
};

export default LoginMobile;