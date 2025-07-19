import * as yup from 'yup';

// Common validation patterns
const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Transaction validation schema
export const transactionSchema = yup.object().shape({
  date: yup
    .date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .typeError('Amount must be a number'),
  description: yup
    .string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description must be less than 200 characters'),
  category: yup
    .string()
    .required('Category is required'),
  type: yup
    .string()
    .required('Transaction type is required')
    .oneOf(['income', 'expense', 'transfer'], 'Invalid transaction type'),
  accountId: yup
    .string()
    .required('Account is required'),
});

// Invoice validation schema
export const invoiceSchema = yup.object().shape({
  invoiceNumber: yup
    .string()
    .required('Invoice number is required')
    .matches(/^[A-Z0-9-]+$/, 'Invoice number can only contain letters, numbers, and hyphens'),
  customerId: yup
    .string()
    .required('Customer is required'),
  issueDate: yup
    .date()
    .required('Issue date is required')
    .max(new Date(), 'Issue date cannot be in the future'),
  dueDate: yup
    .date()
    .required('Due date is required')
    .min(yup.ref('issueDate'), 'Due date must be after issue date'),
  lineItems: yup
    .array()
    .of(yup.object().shape({
      description: yup.string().required('Item description is required'),
      quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
      rate: yup.number().min(0, 'Rate must be non-negative').required('Rate is required'),
    }))
    .min(1, 'At least one line item is required'),
  taxRate: yup
    .number()
    .min(0, 'Tax rate must be non-negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  paymentTerms: yup
    .string()
    .required('Payment terms are required'),
});

// Business validation schema
export const businessSchema = yup.object().shape({
  name: yup
    .string()
    .required('Business name is required')
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  type: yup
    .string()
    .required('Business type is required')
    .oneOf(['corporation', 'llc', 'partnership', 'sole_proprietorship'], 'Invalid business type'),
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Please enter a valid phone number'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  gstin: yup
    .string()
    .matches(gstinRegex, 'Please enter a valid GSTIN'),
  pan: yup
    .string()
    .matches(panRegex, 'Please enter a valid PAN'),
});

// Account validation schema
export const accountSchema = yup.object().shape({
  name: yup
    .string()
    .required('Account name is required')
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must be less than 100 characters'),
  code: yup
    .string()
    .required('Account code is required')
    .matches(/^[0-9]{4}$/, 'Account code must be 4 digits'),
  type: yup
    .string()
    .required('Account type is required')
    .oneOf(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], 'Invalid account type'),
  category: yup
    .string()
    .required('Account category is required'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
});

// User profile validation schema
export const userProfileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Please enter a valid phone number'),
  currentPassword: yup
    .string()
    .when('$isPasswordChange', {
      is: true,
      then: yup.string().required('Current password is required'),
    }),
  newPassword: yup
    .string()
    .when('$isPasswordChange', {
      is: true,
      then: yup
        .string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    }),
  confirmPassword: yup
    .string()
    .when('$isPasswordChange', {
      is: true,
      then: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
    }),
});

// Customer validation schema
export const customerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Customer name is required')
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Please enter a valid phone number'),
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),
  gstin: yup
    .string()
    .matches(gstinRegex, 'Please enter a valid GSTIN'),
});

// Utility functions for formatting
export const formatCurrency = (value) => {
  if (!value) return '';
  const number = parseFloat(value);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return value;
};

export const formatGSTIN = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 2)}${cleaned.slice(2, 7)}${cleaned.slice(7, 11)}${cleaned.slice(11, 12)}${cleaned.slice(12, 13)}${cleaned.slice(13)}`;
  }
  return cleaned;
};

export const formatPAN = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}${cleaned.slice(5, 9)}${cleaned.slice(9)}`;
  }
  return cleaned;
};

export const formatPercentage = (value) => {
  if (!value) return '';
  const number = parseFloat(value);
  if (isNaN(number)) return '';
  return `${number.toFixed(2)}%`;
};

// Validation helper functions
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateAmount = (amount) => {
  const number = parseFloat(amount);
  if (isNaN(number)) {
    return 'Amount must be a valid number';
  }
  if (number < 0) {
    return 'Amount cannot be negative';
  }
  return null;
};

export const validateDate = (date) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }
  if (dateObj > new Date()) {
    return 'Date cannot be in the future';
  }
  return null;
};

export default {
  transactionSchema,
  invoiceSchema,
  businessSchema,
  accountSchema,
  userProfileSchema,
  customerSchema,
  formatCurrency,
  formatPhoneNumber,
  formatGSTIN,
  formatPAN,
  formatPercentage,
  validateRequired,
  validateEmail,
  validateAmount,
  validateDate,
}; 