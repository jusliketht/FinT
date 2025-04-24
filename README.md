# FinT - Financial Management System

A comprehensive financial management system built with the MERN stack (MongoDB, Express, React, Node.js), tailored for personal, business, and enterprise use in India. The system prioritizes Indian accounting standards (Ind AS) and multi-role access.

## Features

- **User Management & Roles**
  - Admin, Accountant, and Viewer roles with appropriate permissions
  - Secure authentication using JWT and bcrypt

- **File Upload & Processing**
  - Upload bank statements (PDF/Excel)
  - Automatic transaction extraction using digital PDF parsing, OCR for scanned PDFs, and Excel parsing
  - Support for HDFC, ICICI, and SBI bank statement formats

- **Transaction Categorization**
  - Rule-based categorization using regular expressions
  - Default categories aligned with Indian GST/HSN codes
  - Manual override for uncategorized transactions

- **Financial Reporting**
  - Balance Sheet
  - Profit & Loss Statement
  - Cash Flow Statement
  - PDF export of all reports

- **GST Compliance**
  - GST calculation with SGST/CGST components
  - Support for different GST rates (5%, 12%, 18%, etc.)

## Tech Stack

- **Frontend**: React, Redux Toolkit, Ant Design
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT, bcrypt
- **File Processing**: PDF.js, ExcelJS, Tesseract.js (OCR)
- **Reporting**: pdfmake (PDF generation)

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas URI)

### Server Setup

1. Navigate to the server directory:
```
cd server
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fint
JWT_SECRET=your_jwt_secret_change_this_in_production
FILE_UPLOAD_PATH=./uploads
NODE_ENV=development
```

4. Start the server:
```
npm run dev
```

### Client Setup

1. Navigate to the client directory:
```
cd client
```

2. Install dependencies:
```
npm install
```

3. Start the client:
```
npm start
```

The application will be available at http://localhost:3000

## Usage

1. **Register/Login**: Create an account or log in with existing credentials.

2. **Dashboard**: View financial statistics and recent transactions.

3. **Upload Statements**: 
   - Click on the "Upload Statement" section in the Dashboard.
   - Drag and drop or select a PDF or Excel file.
   - Click "Upload and Process" to extract transactions.

4. **Generate Reports**:
   - Navigate to the Reports page.
   - Select the desired report type and date range.
   - Click "Generate" to download the PDF report.

5. **Manage Rules**:
   - Navigate to the Settings page.
   - Create, edit, or delete categorization rules.

## Development

### Project Structure

```
fint/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── redux/           # Redux store and slices
│       ├── services/        # API service
│       └── styles/          # CSS files
│
└── server/                  # Node.js backend
    ├── config/              # Configuration
    ├── controllers/         # Route controllers
    ├── middleware/          # Custom middleware
    ├── models/              # MongoDB models
    ├── routes/              # API routes
    ├── services/            # Business logic
    └── utils/               # Utility functions
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Ant Design](https://ant.design/) - UI Library
- [Chart.js](https://www.chartjs.org/) - Charts
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF Processing
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR Engine