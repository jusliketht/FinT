import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Select,
  Input,
  Alert,
  IconButton,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Table,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { DownloadIcon, PrintIcon } from '@chakra-ui/icons';
import { useToast } from '../../contexts/ToastContext';
import { useApi } from '../../hooks/useApi';

const Reports = () => {
  const api = useApi();
  const { showToast } = useToast();

  // Static theme colors since useColorModeValue is not available in Chakra UI v3
  const colors = {
    primary: '#3182CE',
    secondary: '#718096',
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    info: '#3182CE',
    background: '#FFFFFF',
    surface: '#F7FAFC',
    text: '#2D3748',
    textSecondary: '#718096'
  };

  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'income-statement', label: 'Income Statement' },
    { value: 'balance-sheet', label: 'Balance Sheet' },
    { value: 'cash-flow', label: 'Cash Flow Statement' },
    { value: 'trial-balance', label: 'Trial Balance' },
    { value: 'general-ledger', label: 'General Ledger' }
  ];

  const generateReport = async () => {
    if (!reportType) {
      showToast('Please select a report type', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/reports/generate', {
        params: {
          type: reportType,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      });
      
      setReportData(response.data);
      showToast('Report generated successfully', 'success');
    } catch (error) {
      showToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!reportData) {
      showToast('No report data to export', 'warning');
      return;
    }

    try {
      const response = await api.get('/reports/export', {
        params: {
          type: reportType,
          format,
          startDate: dateRange.start,
          endDate: dateRange.end
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to export report', 'error');
    }
  };

  const printReport = () => {
    if (!reportData) {
      showToast('No report data to print', 'warning');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportType} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportType.replace('-', ' ').toUpperCase()} Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <h2>Summary</h2>
            <p>Report Type: ${reportType}</p>
            <p>Period: ${dateRange.start} to ${dateRange.end}</p>
          </div>
          <div class="content">
            ${generateReportHTML()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const generateReportHTML = () => {
    if (!reportData) return '<p>No data available</p>';

    switch (reportType) {
      case 'income-statement':
        return `
          <table>
            <thead>
              <tr><th>Item</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Revenue</td><td>₹${reportData.revenue?.toLocaleString() || 0}</td></tr>
              <tr><td>Expenses</td><td>₹${reportData.expenses?.toLocaleString() || 0}</td></tr>
              <tr><td><strong>Net Income</strong></td><td><strong>₹${reportData.netIncome?.toLocaleString() || 0}</strong></td></tr>
            </tbody>
          </table>
        `;
      case 'balance-sheet':
        return `
          <table>
            <thead>
              <tr><th>Item</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Assets</td><td>₹${reportData.assets?.toLocaleString() || 0}</td></tr>
              <tr><td>Liabilities</td><td>₹${reportData.liabilities?.toLocaleString() || 0}</td></tr>
              <tr><td><strong>Equity</strong></td><td><strong>₹${reportData.equity?.toLocaleString() || 0}</strong></td></tr>
            </tbody>
          </table>
        `;
      default:
        return '<p>Report content will be displayed here</p>';
    }
  };

  const generateCSV = () => {
    if (!reportData) return '';

    const headers = ['Item', 'Amount'];
    const rows = [];

    switch (reportType) {
      case 'income-statement':
        rows.push(['Revenue', reportData.revenue || 0]);
        rows.push(['Expenses', reportData.expenses || 0]);
        rows.push(['Net Income', reportData.netIncome || 0]);
        break;
      case 'balance-sheet':
        rows.push(['Assets', reportData.assets || 0]);
        rows.push(['Liabilities', reportData.liabilities || 0]);
        rows.push(['Equity', reportData.equity || 0]);
        break;
      default:
        rows.push(['No Data', '']);
    }

    const csvRows = [headers, ...rows];
    return csvRows.join('\n');
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'income-statement':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Revenue</Heading>
              <Stat>
                <StatNumber color="green.500">₹{reportData.revenue?.toLocaleString()}</StatNumber>
              </Stat>
            </Box>
            
            <Box borderBottom="1px" borderColor="gray.200" my={4} />
            
            <Box>
              <Heading size="md" mb={4}>Expenses</Heading>
              <Stat>
                <StatNumber color="red.500">₹{reportData.expenses?.toLocaleString()}</StatNumber>
              </Stat>
            </Box>
            
            <Box borderBottom="1px" borderColor="gray.200" my={4} />
            
            <Box>
              <Heading size="md" mb={4}>Net Income</Heading>
              <Stat>
                <StatNumber color={reportData.netIncome >= 0 ? "green.500" : "red.500"}>
                  ₹{reportData.netIncome?.toLocaleString()}
                  <StatArrow type={reportData.netIncome >= 0 ? "increase" : "decrease"} />
                </StatNumber>
              </Stat>
            </Box>
          </VStack>
        );

      case 'balance-sheet':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Assets</Heading>
              <Stat>
                <StatNumber color="green.500">₹{reportData.assets?.toLocaleString()}</StatNumber>
              </Stat>
            </Box>
            
            <Box borderBottom="1px" borderColor="gray.200" my={4} />
            
            <Box>
              <Heading size="md" mb={4}>Liabilities</Heading>
              <Stat>
                <StatNumber color="red.500">₹{reportData.liabilities?.toLocaleString()}</StatNumber>
              </Stat>
            </Box>
            
            <Box borderBottom="1px" borderColor="gray.200" my={4} />
            
            <Box>
              <Heading size="md" mb={4}>Equity</Heading>
              <Stat>
                <StatNumber color="blue.500">₹{reportData.equity?.toLocaleString()}</StatNumber>
              </Stat>
            </Box>
          </VStack>
        );

      default:
        return (
          <Box>
            <Text>Report data will be displayed here</Text>
          </Box>
        );
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Financial Reports</Heading>

      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={4} w="100%">
              <Box mb={4}>
                <Text fontWeight="medium" mb={2}>Report Type</Text>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  placeholder="Select report type"
                >
                  {reportTypes.map((report) => (
                    <option key={report.value} value={report.value}>
                      {report.label}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box mb={4}>
                <Text fontWeight="medium" mb={2}>Start Date</Text>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </Box>

              <Box mb={4}>
                <Text fontWeight="medium" mb={2}>End Date</Text>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </Box>
            </HStack>

            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={generateReport}
                isLoading={loading}
                loadingText="Generating..."
              >
                Generate Report
              </Button>
              {reportData && (
                <>
                  <Button
                    leftIcon={<DownloadIcon />}
                    onClick={() => exportReport('csv')}
                    variant="outline"
                  >
                    Download CSV
                  </Button>
                  <Button
                    leftIcon={<PrintIcon />}
                    onClick={printReport}
                    variant="outline"
                  >
                    Print
                  </Button>
                </>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {reportData && (
        <Card>
          <CardBody>
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f7fafc' }}>
                  <tr>
                    {Object.keys(reportData[0] || {}).map(header => (
                      <th key={header} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardBody>
        </Card>
      )}

      {reportData && (
        <Card>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="lg">{reportData.title}</Heading>
              <Text color="gray.600">
                Generated on {new Date().toLocaleDateString()}
              </Text>
            </Box>
            
            <Box borderBottom="1px" borderColor="gray.200" my={4} />
            
            {renderReportContent()}
          </VStack>
        </Card>
      )}
    </Box>
  );
};

export default Reports; 