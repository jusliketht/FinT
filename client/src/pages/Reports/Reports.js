import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Form,
  DatePicker,
  Button,
  Card,
  Space,
  Alert,
  Divider,
  Row,
  Col
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  FundOutlined
} from '@ant-design/icons';
import {
  generateBalanceSheet,
  generateProfitLoss,
  generateCashFlow,
  clearError
} from '../../redux/slices/transactionSlice';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const dispatch = useDispatch();
  const { reportLoading, error } = useSelector((state) => state.transactions);
  
  const [balanceSheetForm] = Form.useForm();
  const [profitLossForm] = Form.useForm();
  const [cashFlowForm] = Form.useForm();
  
  const handleGenerateBalanceSheet = (values) => {
    const params = {};
    if (values.asOfDate) {
      params.asOfDate = values.asOfDate.format('YYYY-MM-DD');
    }
    dispatch(generateBalanceSheet(params));
  };
  
  const handleGenerateProfitLoss = (values) => {
    const params = {};
    if (values.dateRange && values.dateRange.length === 2) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD');
      params.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }
    dispatch(generateProfitLoss(params));
  };
  
  const handleGenerateCashFlow = (values) => {
    const params = {};
    if (values.dateRange && values.dateRange.length === 2) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD');
      params.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }
    dispatch(generateCashFlow(params));
  };
  
  return (
    <div>
      <Title level={2}>Financial Reports</Title>
      
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
      
      <Text>
        Generate financial reports as PDF documents that you can download, print, or share.
      </Text>
      
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>Balance Sheet</span>
              </Space>
            }
            bordered={true}
          >
            <Text>
              A snapshot of your financial position showing assets, liabilities, and equity.
            </Text>
            
            <Divider />
            
            <Form
              form={balanceSheetForm}
              layout="vertical"
              onFinish={handleGenerateBalanceSheet}
            >
              <Form.Item
                name="asOfDate"
                label="As of Date"
                initialValue={moment()}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={reportLoading}
                  icon={<FileTextOutlined />}
                  block
                >
                  Generate Balance Sheet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>Profit & Loss</span>
              </Space>
            }
            bordered={true}
          >
            <Text>
              Shows your income and expenses over a period, highlighting profitability.
            </Text>
            
            <Divider />
            
            <Form
              form={profitLossForm}
              layout="vertical"
              onFinish={handleGenerateProfitLoss}
            >
              <Form.Item
                name="dateRange"
                label="Date Range"
                initialValue={[
                  moment().startOf('month'),
                  moment()
                ]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={reportLoading}
                  icon={<FileTextOutlined />}
                  block
                >
                  Generate P&L Statement
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <FundOutlined />
                <span>Cash Flow Statement</span>
              </Space>
            }
            bordered={true}
          >
            <Text>
              Tracks the flow of cash in and out of your business, categorized by activities.
            </Text>
            
            <Divider />
            
            <Form
              form={cashFlowForm}
              layout="vertical"
              onFinish={handleGenerateCashFlow}
            >
              <Form.Item
                name="dateRange"
                label="Date Range"
                initialValue={[
                  moment().startOf('month'),
                  moment()
                ]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={reportLoading}
                  icon={<FileTextOutlined />}
                  block
                >
                  Generate Cash Flow
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports; 