import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    // Primary Colors
    primary: {
      50: '#ebf8ff',
      100: '#bee3f8',
      200: '#90cdf4',
      300: '#63b3ed',
      400: '#4299e1',
      500: '#3182ce', // Primary Blue
      600: '#2b6cb0',
      700: '#2c5282',
      800: '#2a4365',
      900: '#1a365d', // Navy Blue
    },
    // Neutral Colors
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    // Semantic Colors
    success: {
      50: '#f0fff4',
      500: '#38a169', // Success Green
      600: '#2f855a',
    },
    warning: {
      50: '#fffbeb',
      500: '#d69e2e', // Warning Yellow
      600: '#b7791f',
    },
    error: {
      50: '#fed7d7',
      500: '#e53e3e', // Error Red
      600: '#c53030',
    },
    info: {
      50: '#ebf8ff',
      500: '#3182ce', // Info Blue
      600: '#2b6cb0',
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
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
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
    full: '9999px',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
        borderRadius: 'md',
        fontWeight: 'medium',
        _focus: {
          boxShadow: 'outline',
        },
      },
      sizes: {
        sm: {
          h: '32px',
          px: '3',
          fontSize: 'sm',
        },
        md: {
          h: '40px',
          px: '4',
          fontSize: 'base',
        },
        lg: {
          h: '48px',
          px: '6',
          fontSize: 'lg',
        },
      },
      variants: {
        primary: {
          bg: 'primary.500',
          color: 'white',
          _hover: { bg: 'primary.600' },
          _active: { bg: 'primary.700' },
        },
        secondary: {
          bg: 'white',
          color: 'primary.500',
          border: '1px solid',
          borderColor: 'primary.500',
          _hover: { bg: 'primary.50' },
        },
        ghost: {
          bg: 'transparent',
          color: 'primary.500',
          _hover: { bg: 'primary.50' },
        },
        danger: {
          bg: 'error.500',
          color: 'white',
          _hover: { bg: 'error.600' },
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
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
      sizes: {
        sm: {
          field: {
            h: '32px',
            px: '3',
            fontSize: 'sm',
          },
        },
        md: {
          field: {
            h: '40px',
            px: '4',
            fontSize: 'base',
          },
        },
        lg: {
          field: {
            h: '48px',
            px: '4',
            fontSize: 'lg',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'lg',
          boxShadow: 'md',
          p: '6',
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
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          px: '4',
          py: '3',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.100',
          px: '4',
          py: '3',
        },
        tr: {
          _hover: {
            bg: 'gray.50',
          },
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
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme; 