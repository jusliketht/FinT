import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Logger,
  UseGuards,
  UsePipes,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsString, IsOptional } from 'class-validator';
import { PdfStatementService } from './pdf-statement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// Custom pipe that does nothing - to skip validation
class NoValidationPipe {
  transform(value: any) {
    return value;
  }
}

export class UploadPdfDto {
  @IsString()
  bankType: string;
  
  @IsOptional()
  @IsString()
  password?: string;
}

@Controller('pdf-statements')
@UseGuards(JwtAuthGuard)
export class PdfStatementController {
  private readonly logger = new Logger(PdfStatementController.name);

  constructor(private readonly pdfStatementService: PdfStatementService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: undefined, // Use memory storage
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      console.log('Multer fileFilter called with:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Only PDF files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async uploadStatement(
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() request: Request,
  ) {
    try {
      this.logger.log(`Received PDF upload request for bank: ${body.bankType}`);
      
      // Log request details
      this.logger.log('Request details:', {
        method: request.method,
        url: request.url,
        headers: {
          'content-type': request.headers['content-type'],
          'content-length': request.headers['content-length'],
          'authorization': request.headers.authorization ? 'Present' : 'Not present'
        }
      });
      
      this.logger.log(`File received:`, file ? {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'Buffer present' : 'No buffer'
      } : 'No file received');
      
      this.logger.log(`Body received:`, body);
      
      // Log raw request body for debugging
      this.logger.log('Raw request body keys:', Object.keys(request.body || {}));
      this.logger.log('Request files:', (request as any).files);
      this.logger.log('Request file:', (request as any).file);

      // Validate file
      if (!file) {
        throw new BadRequestException('No file uploaded. Please ensure you are sending a file with the field name "file"');
      }

      const validation = this.pdfStatementService.validateFile(file);
      if (!validation.isValid) {
        throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Validate bank type
      const supportedBanks = this.pdfStatementService.getSupportedBanks();
      if (!supportedBanks.includes(body.bankType)) {
        throw new BadRequestException(`Unsupported bank type. Supported types: ${supportedBanks.join(', ')}`);
      }

      // Process the bank statement
      const result = await this.pdfStatementService.processBankStatement(
        file,
        body.bankType,
        body.password,
      );

      if (!result.success) {
        throw new BadRequestException(`Processing failed: ${result.errors?.join(', ')}`);
      }

      return {
        success: true,
        message: 'Bank statement processed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error processing PDF upload:', error);
      throw error;
    }
  }

  @Post('upload-batch')
  @UseInterceptors(FileInterceptor('files'))
  async uploadBatchStatements(
    @UploadedFile() files: any[],
    @Body() body: any, // Use any instead of UploadPdfDto for multipart uploads
  ) {
    try {
      this.logger.log(`Received batch PDF upload request for bank: ${body.bankType}`);

      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          // Validate file
          const validation = this.pdfStatementService.validateFile(file);
          if (!validation.isValid) {
            errors.push(`File ${file.originalname}: ${validation.errors.join(', ')}`);
            continue;
          }

          // Process the bank statement
          const result = await this.pdfStatementService.processBankStatement(
            file,
            body.bankType,
            body.password,
          );

          results.push({
            fileName: file.originalname,
            success: result.success,
            data: result,
          });
        } catch (error) {
          errors.push(`File ${file.originalname}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: 'Batch processing completed',
        data: {
          results,
          errors,
          summary: {
            totalFiles: files.length,
            successfulFiles: results.filter(r => r.success).length,
            failedFiles: errors.length,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error processing batch PDF upload:', error);
      throw error;
    }
  }

  @Post('supported-banks')
  getSupportedBanks() {
    const banks = this.pdfStatementService.getSupportedBanks();
    return {
      success: true,
      data: banks,
    };
  }
} 