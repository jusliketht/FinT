import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    // Enhanced Primary Colors with Fintech Feel
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Modern Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Enhanced Neutral Colors
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Enhanced Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Modern Green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Modern Yellow
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Modern Red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Modern Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Fintech-specific colors
    fintech: {
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      teal: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
      },
      orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },
    },
  },
  fonts: {
    heading: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  space: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  radii: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Fintech-specific shadows
    'fintech-sm': '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
    'fintech-md': '0 4px 8px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
    'fintech-lg': '0 8px 16px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06)',
    'fintech-xl': '0 16px 32px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.06)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 'medium',
        transition: 'all 0.2s',
        _focus: {
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
        },
        _hover: {
          transform: 'translateY(-1px)',
        },
      },
      sizes: {
        sm: {
          h: '36px',
          px: '4',
          fontSize: 'sm',
        },
        md: {
          h: '44px',
          px: '5',
          fontSize: 'base',
        },
        lg: {
          h: '52px',
          px: '7',
          fontSize: 'lg',
        },
      },
      variants: {
        primary: {
          bg: 'linear-gradient(135deg, primary.500 0%, primary.600 100%)',
          color: 'white',
          boxShadow: 'fintech-md',
          _hover: { 
            bg: 'linear-gradient(135deg, primary.600 0%, primary.700 100%)',
            boxShadow: 'fintech-lg',
          },
          _active: { 
            bg: 'linear-gradient(135deg, primary.700 0%, primary.800 100%)',
            transform: 'translateY(0)',
          },
        },
        secondary: {
          bg: 'white',
          color: 'primary.600',
          border: '2px solid',
          borderColor: 'primary.200',
          boxShadow: 'fintech-sm',
          _hover: { 
            bg: 'primary.50',
            borderColor: 'primary.300',
            boxShadow: 'fintech-md',
          },
        },
        ghost: {
          bg: 'transparent',
          color: 'primary.600',
          _hover: { 
            bg: 'primary.50',
            transform: 'translateY(-1px)',
          },
        },
        danger: {
          bg: 'linear-gradient(135deg, error.500 0%, error.600 100%)',
          color: 'white',
          boxShadow: 'fintech-md',
          _hover: { 
            bg: 'linear-gradient(135deg, error.600 0%, error.700 100%)',
            boxShadow: 'fintech-lg',
          },
        },
        success: {
          bg: 'linear-gradient(135deg, success.500 0%, success.600 100%)',
          color: 'white',
          boxShadow: 'fintech-md',
          _hover: { 
            bg: 'linear-gradient(135deg, success.600 0%, success.700 100%)',
            boxShadow: 'fintech-lg',
          },
        },
      },
      defaultProps: {
        variant: 'primary',
        size: 'md',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
          border: '2px solid',
          borderColor: 'gray.200',
          bg: 'white',
          transition: 'all 0.2s',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
          _hover: {
            borderColor: 'gray.300',
          },
        },
      },
      sizes: {
        sm: {
          field: {
            h: '36px',
            px: '4',
            fontSize: 'sm',
          },
        },
        md: {
          field: {
            h: '44px',
            px: '5',
            fontSize: 'base',
          },
        },
        lg: {
          field: {
            h: '52px',
            px: '5',
            fontSize: 'lg',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'fintech-md',
          border: '1px solid',
          borderColor: 'gray.100',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            boxShadow: 'fintech-lg',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    Table: {
      baseStyle: {
        table: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        th: {
          bg: 'gray.50',
          fontWeight: 'semibold',
          textTransform: 'none',
          letterSpacing: 'normal',
          borderBottom: '2px solid',
          borderColor: 'gray.200',
          px: '5',
          py: '4',
          fontSize: 'sm',
          color: 'gray.700',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.100',
          px: '5',
          py: '4',
          fontSize: 'sm',
        },
        tr: {
          transition: 'all 0.2s',
          _hover: {
            bg: 'gray.50',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
          boxShadow: 'fintech-xl',
        },
        header: {
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          pb: '4',
        },
        body: {
          py: '6',
        },
        footer: {
          borderTop: '1px solid',
          borderColor: 'gray.200',
          pt: '4',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
        fontFamily: 'body',
        fontSize: 'base',
        lineHeight: 'normal',
      },
      // Enhanced scrollbar styling
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'gray.100',
        borderRadius: 'full',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'gray.300',
        borderRadius: 'full',
        '&:hover': {
          bg: 'gray.400',
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme; 