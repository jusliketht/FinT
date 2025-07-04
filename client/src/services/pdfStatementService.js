import api from './api';

const RESOURCE_URL = '/pdf-statements';

/**
 * PDF Statement Service for backend API calls
 */
class PdfStatementService {
  constructor() {
    this.api = api;
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   */
  handleError(error, defaultMessage = 'An error occurred') {
    console.error('PDF Statement Service Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || defaultMessage;
      throw new Error(message);
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || defaultMessage);
    }
  }

  /**
   * Upload and process a single PDF bank statement
   * @param {File} file - PDF file to upload
   * @param {string} bankType - Type of bank (hdfc, icici, sbi, etc.)
   * @param {string} password - Optional PDF password
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} Processing result
   */
  async uploadBankStatement(file, bankType, password = '', onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankType', bankType);
      if (password) {
        formData.append('password', password);
      }

      // Debug: Log what's being sent
      console.log('Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bankType,
        hasPassword: !!password
      });

      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData entry - ${key}:`, value);
      }

      const config = {
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      const response = await this.api.post(`${RESOURCE_URL}/upload`, formData, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to upload bank statement');
    }
  }

  /**
   * Upload and process multiple PDF bank statements
   * @param {File[]} files - Array of PDF files to upload
   * @param {string} bankType - Type of bank
   * @param {string} password - Optional PDF password
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} Batch processing result
   */
  async uploadBatchStatements(files, bankType, password = '', onProgress = null) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('bankType', bankType);
      if (password) {
        formData.append('password', password);
      }

      const config = {
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      const response = await this.api.post(`${RESOURCE_URL}/upload-batch`, formData, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to upload batch bank statements');
    }
  }

  /**
   * Get supported bank types
   * @returns {Promise<Array>} List of supported bank types
   */
  async getSupportedBanks() {
    try {
      const response = await this.api.post(`${RESOURCE_URL}/supported-banks`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get supported banks');
    }
  }

  /**
   * Check if PDF is password protected
   * @param {File} file - PDF file to check
   * @returns {Promise<boolean>} True if password protected
   */
  async checkPdfPasswordProtection(file) {
    console.log('Password protection check - input file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // This is a client-side check - in a real implementation,
    // you might want to send a small sample to the server
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const array = new Uint8Array(e.target.result);
        const header = String.fromCharCode.apply(null, array.subarray(0, 1024));
        
        // Check for encryption indicators in PDF header
        const isEncrypted = header.includes('/Encrypt') || 
                           header.includes('/Filter') ||
                           header.includes('/EncryptMetadata');
        
        console.log('Password protection check result:', isEncrypted);
        resolve(isEncrypted);
      };
      reader.onerror = (error) => {
        console.error('Error reading file for password check:', error);
        resolve(false);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate PDF file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validatePdfFile(file) {
    const errors = [];
    const warnings = [];

    // Check file type
    if (file.type !== 'application/pdf') {
      errors.push('File must be a PDF document');
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    // Check file name
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      warnings.push('File should have a .pdf extension');
    }

    // Check if file appears to be empty
    if (file.size === 0) {
      errors.push('File appears to be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get processing status for a batch upload
   * @param {string} processId - Process ID from batch upload
   * @returns {Promise<Object>} Processing status
   */
  async getProcessingStatus(processId) {
    try {
      const response = await this.api.get(`${RESOURCE_URL}/status/${processId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get processing status');
    }
  }

  /**
   * Download processed results
   * @param {string} processId - Process ID
   * @param {string} format - Download format (csv, json, pdf)
   * @returns {Promise<Blob>} File blob
   */
  async downloadResults(processId, format = 'json') {
    try {
      const response = await this.api.get(`${RESOURCE_URL}/download/${processId}`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to download results');
    }
  }

  /**
   * Get processing history
   * @param {Object} filters - Optional filters (date range, bank type, etc.)
   * @returns {Promise<Array>} Processing history
   */
  async getProcessingHistory(filters = {}) {
    try {
      const response = await this.api.get(`${RESOURCE_URL}/history`, { params: filters });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get processing history');
    }
  }

  /**
   * Delete processed statement
   * @param {string} statementId - Statement ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteStatement(statementId) {
    try {
      const response = await this.api.delete(`${RESOURCE_URL}/${statementId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to delete statement');
    }
  }
}

export default new PdfStatementService(); 