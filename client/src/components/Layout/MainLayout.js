import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Menu,
  Button,
  theme,
  Dropdown,
  Avatar,
  Space,
  Typography
} from 'antd';
import {
  PieChartOutlined,
  FileOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { logoutUser } from '../../redux/slices/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Find the active menu key based on current path
  const getActiveMenuKey = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return '1';
    if (path.includes('/reports')) return '2';
    if (path.includes('/settings')) return '3';
    return '1'; // Default to dashboard
  };

  // Handle user logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  // User dropdown menu items
  const userMenuItems = [
    {
      key: '1',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: '2',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={220} 
        collapsible 
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64, margin: '16px 0' }}>
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'FinT' : 'FinT Finance'}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[getActiveMenuKey()]}
          items={[
            {
              key: '1',
              icon: <PieChartOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/dashboard'),
            },
            {
              key: '2',
              icon: <FileOutlined />,
              label: 'Reports',
              onClick: () => navigate('/reports'),
            },
            // Only show settings for admin and accountant
            user && ['admin', 'accountant'].includes(user.role) && {
              key: '3',
              icon: <SettingOutlined />,
              label: 'Settings',
              onClick: () => navigate('/settings'),
            },
          ].filter(Boolean)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              <Space direction="vertical" size={0}>
                <Text strong>{user?.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </Text>
              </Space>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 