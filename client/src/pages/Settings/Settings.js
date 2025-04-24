import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  Popconfirm,
  Tag,
  message,
  Divider,
  Alert
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TagOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [form] = Form.useForm();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);
  
  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/rules');
      setRules(response.data);
    } catch (error) {
      setError('Failed to fetch rules. Please try again.');
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const onFinish = async (values) => {
    try {
      setFormLoading(true);
      setError(null);
      
      if (editing) {
        // Update rule
        await api.put(`/rules/${editing._id}`, values);
        message.success('Rule updated successfully');
      } else {
        // Create new rule
        await api.post('/rules', values);
        message.success('Rule created successfully');
      }
      
      // Reset form and refresh rules
      form.resetFields();
      setEditing(null);
      fetchRules();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving rule');
      console.error('Error saving rule:', error);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDelete = async (ruleId) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/rules/${ruleId}`);
      message.success('Rule deleted successfully');
      fetchRules();
    } catch (error) {
      setError('Failed to delete rule. Please try again.');
      console.error('Error deleting rule:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (rule) => {
    setEditing(rule);
    form.setFieldsValue({
      pattern: rule.pattern,
      category: rule.category
    });
  };
  
  const handleCancel = () => {
    setEditing(null);
    form.resetFields();
  };
  
  const columns = [
    {
      title: 'Pattern',
      dataIndex: 'pattern',
      key: 'pattern',
      render: (text) => <code>{text}</code>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this rule?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>Settings</Title>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Card title="Transaction Categorization Rules">
        <Paragraph>
          Create rules to automatically categorize transactions based on their descriptions.
          Use regular expressions to match transaction descriptions.
        </Paragraph>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="pattern"
            label="Pattern (Regex)"
            rules={[
              { required: true, message: 'Please enter a pattern' }
            ]}
            tooltip="Enter a regular expression pattern to match against transaction descriptions"
          >
            <Input prefix={<TagOutlined />} placeholder="e.g. zomato|swiggy" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[
              { required: true, message: 'Please enter a category' }
            ]}
          >
            <Input placeholder="e.g. Food & Dining" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={formLoading}
                icon={editing ? <EditOutlined /> : <PlusOutlined />}
              >
                {editing ? 'Update Rule' : 'Add Rule'}
              </Button>
              
              {editing && (
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
        
        <Divider />
        
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Settings; 