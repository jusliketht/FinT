import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  Progress,
  Card,
  CardBody,
  Icon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AttachmentIcon } from '@chakra-ui/icons';
import { useToast } from '../../contexts/ToastContext';
import pdfStatementService from '../../services/pdfStatementService';

const BankStatementUpload = ({ onUpload, isLoading = false }) => {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const bankTypes = [
    { value: 'hdfc', label: 'HDFC Bank' },
    { value: 'icici', label: 'ICICI Bank' },
    { value: 'sbi', label: 'State Bank of India' },
    { value: 'axis', label: 'Axis Bank' },
    { value: 'kotak', label: 'Kotak Mahindra Bank' },
    { value: 'yes', label: 'Yes Bank' },
    { value: 'other', label: 'Other' }
  ];

  const [selectedBank, setSelectedBank] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const { showToast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    } : 'No file');
    
    if (file) {
      // Validate file
      const validation = pdfStatementService.validatePdfFile(file);
      console.log('File validation result:', validation);
      
      if (!validation.isValid) {
        showToast(validation.errors[0], 'error');
        return;
      }
      
      if (validation.warnings.length > 0) {
        showToast(validation.warnings[0], 'warning');
      }
      
      setSelectedFile(file);
      setError(null);
      console.log('File set as selectedFile:', file.name);
    }
  };

  const handleBankChange = (event) => {
    setSelectedBank(event.target.value);
  };

  const processFile = async (file, password = null) => {
    if (!file || !selectedBank) {
      showToast('Please select a file and bank type', 'error');
      return;
    }

    // Debug: Log file details before upload
    console.log('Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      selectedBank,
      hasPassword: !!password
    });

    // Debug: Check if file is actually a File object
    if (!(file instanceof File)) {
      console.error('File is not a File object:', file);
      showToast('Invalid file object', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setUploadProgress(0);
      setProcessingProgress(0);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Starting file upload...');
      
      // Process the file with real backend
      const result = await pdfStatementService.uploadBankStatement(
        file,
        selectedBank,
        password,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      console.log('Upload completed, result:', result);

      clearInterval(uploadInterval);
      setUploadProgress(100);
      setProcessingProgress(100);

      if (result.success) {
        showToast('Statement uploaded and processed successfully', 'success');
        console.log('Processing result:', result);
        
        // Call the onUpload callback with the result
        if (onUpload) {
          onUpload(result.data);
        }
      } else {
        throw new Error(result.message || 'Processing failed');
      }

      // Reset form
      setSelectedFile(null);
      setSelectedBank('');
      setPassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      showToast(`Failed to upload statement: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'error');
      return;
    }

    if (!selectedBank) {
      showToast('Please select a bank type', 'error');
      return;
    }

    console.log('Before password check - selectedFile:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });

    // Check if PDF might be password protected
    const isPasswordProtected = await pdfStatementService.checkPdfPasswordProtection(selectedFile);
    
    console.log('After password check - selectedFile:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });
    
    console.log('Password protection check result:', isPasswordProtected);
    
    if (isPasswordProtected) {
      setCurrentFile(selectedFile);
      setShowPasswordDialog(true);
    } else {
      await processFile(selectedFile);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      showToast('Password is required', 'error');
      return;
    }

    setShowPasswordDialog(false);
    await processFile(currentFile, password);
    setPassword('');
    setCurrentFile(null);
  };

  return (
    <Box p={6}>
      <Card variant="outlined">
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Upload Bank Statement
              </Text>
              <Text color="gray.600">
                Select your bank statement PDF file and choose the bank type for processing.
              </Text>
            </Box>

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Box>
              <Text fontWeight="medium" mb={2}>
                Select Bank Type
              </Text>
              <select
                value={selectedBank}
                onChange={handleBankChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Choose a bank...</option>
                {bankTypes.map(bank => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <Text fontWeight="medium" mb={2}>
                Select PDF File
              </Text>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {selectedFile && (
                <Text fontSize="sm" color="green.600" mt={2}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Text>
              )}
            </Box>

            {(uploadProgress > 0 || processingProgress > 0) && (
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text fontSize="sm" mb={1}>Upload Progress</Text>
                  <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                </Box>
                <Box>
                  <Text fontSize="sm" mb={1}>Processing</Text>
                  <Progress value={processingProgress} size="sm" colorScheme="green" />
                </Box>
              </VStack>
            )}

            <Button
              colorScheme="blue"
              leftIcon={<Icon as={AttachmentIcon} />}
              onClick={handleUpload}
              isLoading={isLoading || isProcessing}
              isDisabled={!selectedFile || !selectedBank || isProcessing}
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Upload Statement'}
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            maxW="400px"
            w="full"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              PDF Password Required
            </Text>
            
            <VStack spacing={4}>
              <Text color="gray.600">
                This PDF file appears to be password protected. Please enter the password to continue.
              </Text>
              
              <Input
                type="password"
                placeholder="Enter PDF password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
            </VStack>
            
            <HStack spacing={3} mt={6} justify="flex-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                  setCurrentFile(null);
                }}
              >
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handlePasswordSubmit}>
                Submit
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BankStatementUpload;