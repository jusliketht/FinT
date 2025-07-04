# Frontend Documentation

This document provides an overview of the frontend application for FinT.

## Tech Stack

- **React**: The core UI library.
- **Chakra UI**: The component library used for building the user interface.
- **Tailwind CSS**: A utility-first CSS framework for custom styling.
- **Redux Toolkit**: For state management.
- **React Router**: For client-side routing.
- **Axios**: For making API requests to the backend.

## Project Structure

The frontend code is located in the `client/` directory and follows this structure:

```
client/
├── src/
│   ├── assets/         # Static assets like images and fonts
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Common components used across the app
│   │   ├── features/   # Components related to specific features
│   │   └── ...
│   ├── contexts/       # React contexts for global state
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Top-level page components
│   ├── redux/          # Redux store, slices, and actions
│   ├── routes.jsx      # Application routes
│   ├── services/       # Services for interacting with the API
│   ├── theme/          # Chakra UI theme customization
│   └── utils/          # Utility functions
└── ...
```

### Components

- **Common Components**: Located in `src/components/common/`, these are generic, reusable components like buttons, inputs, and layout elements.
- **Feature Components**: Located in `src/components/features/`, these are components that are specific to a particular feature or domain, such as `accounts` or `journal`.

### Pages

Pages are the top-level components for each route in the application. They are located in `src/pages/` and are responsible for composing feature components and layouts.

### State Management

The application uses **Redux Toolkit** for managing global state. The Redux store is configured in `src/redux/store.js`, and feature-specific state is managed in "slices" located in `src/redux/slices/`.

### API Services

API services are responsible for all communication with the backend API. They are located in `src/services/` and use **Axios** to make HTTP requests. Each service typically corresponds to a set of related API endpoints (e.g., `accountService.js`). 