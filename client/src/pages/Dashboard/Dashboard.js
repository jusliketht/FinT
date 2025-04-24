import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Table,
  Upload,
  Button,
  message,
  Divider,
  Alert,
  Tag
} from 'antd';
import {
  FileExcelOutlined,
  FilePdfOutlined,
  InboxOutlined,
  CloudUploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { getTransactions, uploadFile, resetUploadSuccess, clearError } from '../../redux/slices/transactionSlice';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading, uploadLoading, error, uploadSuccess } = useSelector(
    (state) => state.transactions
  );
  const { user } = useSelector((state) => state.auth);
  
  const [fileList, setFileList] = useState([]);
  
  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);
  
  useEffect(() => {
    if (uploadSuccess) {
      message.success('File uploaded and processed successfully');
      setFileList([]);
      dispatch(getTransactions());
      dispatch(resetUploadSuccess());
    }
  }, [uploadSuccess, dispatch]);
  
  // Calculate stats
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalCredits: 0,
        totalDebits: 0,
        balance: 0,
        categoryCounts: {}
      };
    }
    
    const stats = transactions.reduce((acc, transaction) => {
      // Add to total credits or debits
      if (transaction.transactionType === 'credit') {
        acc.totalCredits += transaction.amount;
      } else {
        acc.totalDebits += transaction.amount;
      }
      
      // Count categories
      if (!acc.categoryCounts[transaction.category]) {
        acc.categoryCounts[transaction.category] = 0;
      }
      acc.categoryCounts[transaction.category]++;
      
      return acc;
    }, { totalCredits: 0, totalDebits: 0, categoryCounts: {} });
    
    stats.balance = stats.totalCredits - stats.totalDebits;
    
    return stats;
  };
  
  const stats = calculateStats();
  
  // Upload props
  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.pdf,.xlsx,.xls',
    beforeUpload: (file) => {
      // Check file type
      const isPDF = file.type === 'application/pdf';
      const isExcel = 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel';
      
      if (!isPDF && !isExcel) {
        message.error('You can only upload PDF or Excel files!');
        return Upload.LIST_IGNORE;
      }
      
      // Check file size (50MB max)
      const isLessThan50MB = file.size / 1024 / 1024 < 50;
      if (!isLessThan50MB) {
        message.error('File must be smaller than 50MB!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([]);
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
    },
  };
  
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('Please select a file first');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileList[0]);
    
    dispatch(uploadFile(formData));
  };
  
  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px', display: 'block' }}>{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>,
      filters: Object.keys(stats.categoryCounts).map(category => ({
        text: category,
        value: category,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <span style={{ color: record.transactionType === 'credit' ? '#3f8600' : '#cf1322' }}>
          {record.transactionType === 'credit' ? '+' : '-'}
          ₹{text.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => {
        const aValue = a.transactionType === 'credit' ? a.amount : -a.amount;
        const bValue = b.transactionType === 'credit' ? b.amount : -b.amount;
        return aValue - bValue;
      },
    },
  ];
  
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => dispatch(clearError())}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card className="dashboard-card">
            <Statistic
              title="Total Credits"
              value={stats.totalCredits}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix="₹"
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="dashboard-card">
            <Statistic
              title="Total Debits"
              value={stats.totalDebits}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix="₹"
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="dashboard-card">
            <Statistic
              title="Balance"
              value={stats.balance}
              precision={2}
              valueStyle={{ color: stats.balance >= 0 ? '#3f8600' : '#cf1322' }}
              prefix="₹"
              suffix={stats.balance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Show upload section only to admin and accountant */}
      {user && ['admin', 'accountant'].includes(user.role) && (
        <>
          <Divider orientation="left">Upload Statement</Divider>
          <div className="upload-container">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for PDF bank statements or Excel files. Files will be processed and transactions will be extracted.
              </p>
              <div style={{ marginTop: 16 }}>
                <Tag icon={<FilePdfOutlined />} color="blue">
                  PDF Statement
                </Tag>
                <Tag icon={<FileExcelOutlined />} color="green">
                  Excel File
                </Tag>
              </div>
            </Dragger>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button
                type="primary"
                onClick={handleUpload}
                loading={uploadLoading}
                icon={<CloudUploadOutlined />}
                disabled={fileList.length === 0}
              >
                Upload and Process
              </Button>
            </div>
          </div>
        </>
      )}
      
      <Divider orientation="left">Recent Transactions</Divider>
      <Table
        columns={columns}
        dataSource={transactions.map(transaction => ({ ...transaction, key: transaction._id }))}
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true, 
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Total ${total} transactions`
        }}
      />
    </div>
  );
};

export default Dashboard; 