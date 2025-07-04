# Immediate Next Steps - FinT Development

## 🚀 **Week 1 Priority: PDF Processing Backend**

### **Step 1: Set up PDF Processing Infrastructure**

#### 1.1 Install Dependencies
```bash
# In server directory
npm install tesseract.js pdf-parse multer
npm install @types/multer --save-dev
```

#### 1.2 Create PDF Statement Module Structure
```bash
mkdir -p server/src/pdf-statement/{processors,utils}
touch server/src/pdf-statement/pdf-statement.module.ts
touch server/src/pdf-statement/pdf-statement.service.ts
touch server/src/pdf-statement/pdf-statement.controller.ts
```

#### 1.3 Implement Core PDF Service
**File: `server/src/pdf-statement/pdf-statement.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import * as pdf from 'pdf-parse';

@Injectable()
export class PdfStatementService {
  async extractTextFromPdf(buffer: Buffer, password?: string): Promise<string> {
    // PDF text extraction logic
  }

  async processBankStatement(file: Express.Multer.File, bankType: string): Promise<any> {
    // Bank-specific processing logic
  }

  async generateJournalEntries(transactions: any[]): Promise<any[]> {
    // Auto-generate journal entries
  }
}
```

### **Step 2: Implement Bank-Specific Processors**

#### 2.1 HDFC Bank Processor
**File: `server/src/pdf-statement/processors/hdfc-processor.ts`**
```typescript
export class HdfcProcessor {
  private readonly transactionPattern = /\d{2}\/\d{2}\/\d{4}\s+([^\s]+(?:\s+[^\s]+)*?)\s+([\d,]+\.\d{2})/g;
  
  extractTransactions(text: string): Transaction[] {
    // HDFC-specific transaction extraction
  }
}
```

#### 2.2 ICICI Bank Processor
**File: `server/src/pdf-statement/processors/icici-processor.ts`**
```typescript
export class IciciProcessor {
  private readonly transactionPattern = /\d{2}-\w{3}-\d{4}\s+([^\s]+(?:\s+[^\s]+)*?)\s+([\d,]+\.\d{2})/g;
  
  extractTransactions(text: string): Transaction[] {
    // ICICI-specific transaction extraction
  }
}
```

### **Step 3: Create API Endpoints**

#### 3.1 PDF Upload Endpoint
**File: `server/src/pdf-statement/pdf-statement.controller.ts`**
```typescript
@Controller('pdf-statements')
export class PdfStatementController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStatement(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { bankType: string; password?: string }
  ) {
    // Handle PDF upload and processing
  }
}
```

## 🎯 **Week 2 Priority: Connect Frontend to Backend**

### **Step 1: Update Frontend Service**
**File: `client/src/services/pdfStatementService.js`**
```javascript
// Replace mock implementation with real API calls
async uploadBankStatement(file, bankType, password = '', onProgress = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bankType', bankType);
  formData.append('password', password);

  const response = await this.api.post('/pdf-statements/upload', formData, {
    onUploadProgress: onProgress
  });
  return response.data;
}
```

### **Step 2: Add Transaction Verification UI**
**File: `client/src/components/bankStatements/TransactionVerification.jsx`**
```jsx
const TransactionVerification = ({ transactions, onConfirm, onEdit }) => {
  // Transaction verification interface
};
```

## 📊 **Week 3 Priority: Basic Reports Implementation**

### **Step 1: Create Reports Service**
**File: `server/src/reports/reports.service.ts`**
```typescript
@Injectable()
export class ReportsService {
  async generateIncomeStatement(startDate: Date, endDate: Date): Promise<any> {
    // P&L calculation logic
  }

  async generateBalanceSheet(asOfDate: Date): Promise<any> {
    // Balance sheet calculation
  }

  async generateTrialBalance(asOfDate: Date): Promise<any> {
    // Trial balance calculation
  }
}
```

### **Step 2: Update Frontend Reports**
**File: `client/src/pages/Reports/Reports.js`**
```javascript
// Replace mock data with real API calls
const generateReport = async () => {
  const response = await api.get(`/reports/${reportType}`, {
    params: { startDate, endDate }
  });
  setReportData(response.data);
};
```

## 🏛️ **Week 4 Priority: GST/TDS Foundation**

### **Step 1: Add GST Fields to Schema**
**File: `prisma/schema.prisma`**
```prisma
model JournalEntry {
  // ... existing fields
  gstRate        Float?   // 5%, 12%, 18%, 28%
  gstAmount      Float?
  tdsSection     String?  // 194C, 194J, etc.
  tdsAmount      Float?
  isMsmeVendor   Boolean  @default(false)
}
```

### **Step 2: Create GST Calculator**
**File: `server/src/tax-compliance/gst-calculator.ts`**
```typescript
export class GstCalculator {
  calculateGST(amount: number, rate: number, isInterState: boolean): {
    cgst: number;
    sgst: number;
    igst: number;
  } {
    // GST calculation logic
  }
}
```

## 🔧 **Immediate Technical Tasks**

### **Task 1: Fix Database Schema Issues**
```bash
# Run database migrations
cd server
npx prisma migrate dev --name add_gst_fields
npx prisma generate
```

### **Task 2: Add Error Handling**
```typescript
// Standardize error handling across services
export class AppException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
  }
}
```

### **Task 3: Add Validation**
```typescript
// Add DTOs for all endpoints
export class UploadPdfDto {
  @IsString()
  @IsIn(['hdfc', 'icici', 'sbi', 'axis', 'kotak', 'other'])
  bankType: string;

  @IsOptional()
  @IsString()
  password?: string;
}
```

## 📋 **Daily Development Checklist**

### **Day 1-2: PDF Processing Setup**
- [ ] Install Tesseract.js and dependencies
- [ ] Create PDF statement module structure
- [ ] Implement basic PDF text extraction
- [ ] Test with sample PDF files

### **Day 3-4: Bank Processors**
- [ ] Implement HDFC processor
- [ ] Implement ICICI processor
- [ ] Add transaction pattern matching
- [ ] Test with real bank statements

### **Day 5-7: API Integration**
- [ ] Create upload endpoint
- [ ] Connect frontend to backend
- [ ] Add progress tracking
- [ ] Implement error handling

## 🎯 **Success Criteria for Week 1**

- [ ] PDF upload endpoint responds correctly
- [ ] Text extraction works for HDFC and ICICI statements
- [ ] Transaction parsing accuracy > 80%
- [ ] Frontend can upload and process PDFs
- [ ] Basic error handling implemented

## 🚨 **Blockers & Dependencies**

### **Technical Dependencies**
- Tesseract.js installation and configuration
- PDF parsing library compatibility
- File upload size limits
- Database connection stability

### **Business Dependencies**
- Sample bank statements for testing
- GST calculation rules validation
- Bank statement format documentation

## 📞 **Support & Resources**

### **Documentation**
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [PDF-parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

### **Testing Resources**
- Sample HDFC statement: `test-files/sample-hdfc-statement.pdf`
- Test scripts: `scripts/test-accounting-workflow.js`

---

**Next Review**: After completing Week 1 tasks, review progress and adjust Week 2 priorities accordingly. 