import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Login from '../pages/Login';


// Mock the contexts
const mockLogin = jest.fn().mockResolvedValue({ success: true });
const mockShowToast = jest.fn();
const mockNavigate = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock userService
jest.mock('../services/userService', () => ({
  login: jest.fn().mockResolvedValue({
    user: { id: 1, email: 'test@example.com' },
    access_token: 'mock-token'
  }),
  createUser: jest.fn(),
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock ToastContext
jest.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <Login />
      </ChakraProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Rendering', () => {
    test('renders login form with all required elements', () => {
      renderLogin();
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    });

    test('renders development mode indicator in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      renderLogin();
      
      expect(screen.getByText(/🚀 Development Mode: Demo credentials auto-filled/)).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('does not render development mode indicator in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      renderLogin();
      
      expect(screen.queryByText(/🚀 Development Mode/)).not.toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Form Interaction', () => {
    test('allows typing in email field', () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    test('allows typing in password field', () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput.value).toBe('password123');
    });

    test('toggles password visibility', () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Password toggle button
      
      // Initially password should be hidden
      expect(passwordInput.type).toBe('password');
      
      // Click toggle button
      fireEvent.click(toggleButton);
      
      // Password should be visible
      expect(passwordInput.type).toBe('text');
      
      // Click toggle button again
      fireEvent.click(toggleButton);
      
      // Password should be hidden again
      expect(passwordInput.type).toBe('password');
    });

    test('toggles remember me checkbox', () => {
      renderLogin();
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      expect(rememberMeCheckbox.checked).toBe(false);
      
      fireEvent.click(rememberMeCheckbox);
      
      expect(rememberMeCheckbox.checked).toBe(true);
      
      fireEvent.click(rememberMeCheckbox);
      
      expect(rememberMeCheckbox.checked).toBe(false);
    });
  });

  describe('Form Validation', () => {
    test('shows error when submitting empty form', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Please fill in all fields', 'error');
      });
    });

    test('shows error when email is empty', async () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Please fill in all fields', 'error');
      });
    });

    test('shows error when password is empty', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Please fill in all fields', 'error');
      });
    });
  });

  describe('Login Submission', () => {
    test('calls login function with correct credentials', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('shows loading state during submission', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('handles successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Login successful!', 'success');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles login failure', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Invalid credentials', 'error');
      });
    });

    test('handles login error', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('An error occurred during login', 'error');
      });
    });
  });

  describe('Remember Me Functionality', () => {
    test('saves credentials to localStorage when remember me is checked', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(rememberMeCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('fint_remembered_email', 'test@example.com');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('fint_remembered_password', 'password123');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('fint_remember_me', 'true');
      });
    });

    test('clears credentials from localStorage when remember me is unchecked', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('fint_remembered_email');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('fint_remembered_password');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('fint_remember_me');
      });
    });

    test('loads saved credentials from localStorage on mount', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('saved@example.com') // email
        .mockReturnValueOnce('savedpassword') // password
        .mockReturnValueOnce('true'); // remember me
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      expect(emailInput.value).toBe('saved@example.com');
      expect(passwordInput.value).toBe('savedpassword');
      expect(rememberMeCheckbox.checked).toBe(true);
    });
  });

  describe('Development Mode Auto-fill', () => {
    test('auto-fills demo credentials in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Mock localStorage to return no saved credentials
      localStorageMock.getItem.mockReturnValue(null);
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(rememberMeCheckbox.checked).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    test('prioritizes saved credentials over demo credentials', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      localStorageMock.getItem
        .mockReturnValueOnce('saved@example.com') // email
        .mockReturnValueOnce('savedpassword') // password
        .mockReturnValueOnce('true'); // remember me
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput.value).toBe('saved@example.com');
      expect(passwordInput.value).toBe('savedpassword');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Navigation Links', () => {
    test('renders forgot password link', () => {
      renderLogin();
      
      const forgotPasswordLink = screen.getByText('Forgot your password?');
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    test('renders sign up link', () => {
      renderLogin();
      
      const signUpLink = screen.getByText('Sign up');
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
    });
  });
}); 