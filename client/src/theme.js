import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50:  "#e6f7f5",
      100: "#b9e5e0",
      200: "#8dd3cc",
      300: "#61c1b7",
      400: "#35afa3", // Primary button
      500: "#1c9689", // Main brand color
      600: "#15786e",
      700: "#0f5a53",
      800: "#083c38",
      900: "#021e1d",
    },
    accent: {
      100: "#ffe3e3",
      200: "#ffbfbf",
      300: "#ff9b9b",
      400: "#ff7777",
      500: "#ff5353", // Warnings / actionable highlights
    },
    gray: {
      50:  "#f9f9f9",
      100: "#f0f0f0",
      200: "#d9d9d9",
      300: "#bfbfbf",
      400: "#a6a6a6",
      500: "#8c8c8c",
      600: "#737373",
      700: "#595959",
      800: "#404040",
      900: "#262626",
    },
  },
  fonts: {
    heading: 'Inter, -apple-system, system-ui, sans-serif',
    body: 'Inter, -apple-system, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.400' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'gray.50',
          borderRadius: 'lg',
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'gray.800',
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.700',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  layerStyles: {
    gradientCard: {
      bgGradient: 'linear(to-r, brand.400, brand.600)',
      color: 'white',
      borderRadius: 'lg',
      p: 6,
    },
    card: {
      bg: 'white',
      borderRadius: 'lg',
      boxShadow: 'sm',
      p: 6,
    },
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl'],
      fontWeight: 'bold',
      lineHeight: '110%',
      letterSpacing: '-1%',
    },
    h2: {
      fontSize: ['xl', '2xl'],
      fontWeight: 'semibold',
      lineHeight: '110%',
      letterSpacing: '-1%',
    },
  },
});

export default theme; 