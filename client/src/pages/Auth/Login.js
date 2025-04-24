import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser, clearError } from '../../redux/slices/authSlice';

const { Title } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);
  
  const onFinish = (values) => {
    dispatch(loginUser(values));
  };
  
  return (
    <div className="auth-container">
      <Card className="auth-form-container">
        <Title level={2} className="auth-title">Login</Title>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => dispatch(clearError())}
          />
        )}
        
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="auth-form-button"
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register now!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 