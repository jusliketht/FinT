# Detailed Prompt for Cursor: Third-Party Transaction Tagging

## Objective
Implement a comprehensive third-party transaction tagging system that allows users to mark transactions as being done on behalf of someone else. This feature is essential for maintaining proper records when handling transactions for clients, family members, or other third parties.

## Feature Requirements

### 1. Database Schema Updates

#### A. Update Transaction Model
Modify the existing `Transaction` model in `server/prisma/schema.prisma`:

```prisma
model Transaction {
  id              String   @id @default(uuid())
  date            DateTime
  description     String
  amount          Float
  category        String
  transactionType String
  userId          String
  businessId      String?
  
  // Third-party tagging fields
  isThirdParty    Boolean  @default(false)
  thirdPartyName  String?  // Name of the person/entity on whose behalf transaction was done
  thirdPartyType  String?  // Type: CLIENT, FAMILY, FRIEND, BUSINESS_PARTNER, OTHER
  thirdPartyId    String?  // Optional: Link to a third-party entity record
  notes           String?  // Additional notes about the third-party transaction
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  User            User     @relation(fields: [userId], references: [id])
  Business        Business? @relation(fields: [businessId], references: [id])
  ThirdParty      ThirdParty? @relation(fields: [thirdPartyId], references: [id])

  @@index([category])
  @@index([date])
  @@index([transactionType])
  @@index([userId])
  @@index([businessId])
  @@index([isThirdParty])
  @@index([thirdPartyType])
}
```

#### B. Create ThirdParty Model
Add a new `ThirdParty` model for managing third-party entities:

```prisma
model ThirdParty {
  id            String   @id @default(uuid())
  name          String
  type          String   // CLIENT, FAMILY, FRIEND, BUSINESS_PARTNER, OTHER
  email         String?
  phone         String?
  address       String?
  notes         String?
  userId        String   // User who created this third-party record
  businessId    String?  // Optional: Associated business
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  User          User     @relation(fields: [userId], references: [id])
  Business      Business? @relation(fields: [businessId], references: [id])
  Transactions  Transaction[]

  @@index([userId])
  @@index([businessId])
  @@index([type])
  @@index([isActive])
}
```

#### C. Update User Model
Add relation to ThirdParty in the User model:

```prisma
model User {
  // ... existing fields
  ThirdParties    ThirdParty[]
  // ... rest of relations
}
```

#### D. Update Business Model
Add relation to ThirdParty in the Business model:

```prisma
model Business {
  // ... existing fields
  ThirdParties    ThirdParty[]
  // ... rest of relations
}
```

### 2. Backend Implementation

#### A. Third-Party Service
Create `server/src/third-party/third-party.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThirdPartyDto, UpdateThirdPartyDto, GetThirdPartiesQueryDto } from './dto';

@Injectable()
export class ThirdPartyService {
  constructor(private prisma: PrismaService) {}

  async create(createThirdPartyDto: CreateThirdPartyDto, userId: string) {
    return this.prisma.thirdParty.create({
      data: {
        ...createThirdPartyDto,
        userId,
      },
    });
  }

  async findAll(query: GetThirdPartiesQueryDto, userId: string) {
    const { businessId, type, isActive = true, search } = query;
    
    const where: any = {
      userId,
      isActive,
    };

    if (businessId) {
      where.businessId = businessId;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.thirdParty.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Transactions: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const thirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, userId },
      include: {
        Transactions: {
          orderBy: { date: 'desc' },
          take: 10, // Last 10 transactions
        },
        _count: {
          select: { Transactions: true },
        },
      },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    return thirdParty;
  }

  async update(id: string, updateThirdPartyDto: UpdateThirdPartyDto, userId: string) {
    const thirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, userId },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    return this.prisma.thirdParty.update({
      where: { id },
      data: updateThirdPartyDto,
    });
  }

  async remove(id: string, userId: string) {
    const thirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { Transactions: true },
        },
      },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    // Soft delete if there are associated transactions
    if (thirdParty._count.Transactions > 0) {
      return this.prisma.thirdParty.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no transactions
    return this.prisma.thirdParty.delete({
      where: { id },
    });
  }

  async getThirdPartyTransactions(id: string, userId: string, page = 1, limit = 20) {
    const thirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, userId },
    });

    if (!thirdParty) {
      throw new NotFoundException(`Third party with ID ${id} not found`);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { thirdPartyId: id },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { thirdPartyId: id },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getThirdPartyStats(userId: string, businessId?: string) {
    const where: any = { userId };
    if (businessId) {
      where.businessId = businessId;
    }

    const [totalThirdParties, activeThirdParties, thirdPartyTypes] = await Promise.all([
      this.prisma.thirdParty.count({ where }),
      this.prisma.thirdParty.count({ where: { ...where, isActive: true } }),
      this.prisma.thirdParty.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      totalThirdParties,
      activeThirdParties,
      inactiveThirdParties: totalThirdParties - activeThirdParties,
      typeBreakdown: thirdPartyTypes.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }
}
```

#### B. Third-Party Controller
Create `server/src/third-party/third-party.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ThirdPartyService } from './third-party.service';
import { CreateThirdPartyDto, UpdateThirdPartyDto, GetThirdPartiesQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('third-party')
@ApiBearerAuth()
@Controller('third-party')
@UseGuards(JwtAuthGuard)
export class ThirdPartyController {
  constructor(private readonly thirdPartyService: ThirdPartyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new third party' })
  @ApiResponse({ status: 201, description: 'Third party created successfully' })
  create(@Body() createThirdPartyDto: CreateThirdPartyDto, @Request() req) {
    return this.thirdPartyService.create(createThirdPartyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all third parties' })
  @ApiResponse({ status: 200, description: 'Return all third parties' })
  findAll(@Query() query: GetThirdPartiesQueryDto, @Request() req) {
    return this.thirdPartyService.findAll(query, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get third party statistics' })
  @ApiResponse({ status: 200, description: 'Return third party statistics' })
  getStats(@Query('businessId') businessId: string, @Request() req) {
    return this.thirdPartyService.getThirdPartyStats(req.user.id, businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a third party by id' })
  @ApiResponse({ status: 200, description: 'Return the third party' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.thirdPartyService.findOne(id, req.user.id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transactions for a third party' })
  @ApiResponse({ status: 200, description: 'Return third party transactions' })
  getTransactions(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req,
  ) {
    return this.thirdPartyService.getThirdPartyTransactions(
      id,
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a third party' })
  @ApiResponse({ status: 200, description: 'Third party updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateThirdPartyDto: UpdateThirdPartyDto,
    @Request() req,
  ) {
    return this.thirdPartyService.update(id, updateThirdPartyDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a third party' })
  @ApiResponse({ status: 200, description: 'Third party deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.thirdPartyService.remove(id, req.user.id);
  }
}
```

#### C. Update Transaction Service
Modify `server/src/transactions/transactions.service.ts` to handle third-party tagging:

```typescript
// Add methods to handle third-party transactions
async createWithThirdParty(createTransactionDto: CreateTransactionDto, userId: string) {
  const { thirdPartyId, thirdPartyName, thirdPartyType, isThirdParty, ...transactionData } = createTransactionDto;
  
  // Validate third-party data if isThirdParty is true
  if (isThirdParty) {
    if (!thirdPartyName && !thirdPartyId) {
      throw new BadRequestException('Third party name or ID is required for third-party transactions');
    }
    
    // If thirdPartyId is provided, verify it exists and belongs to the user
    if (thirdPartyId) {
      const thirdParty = await this.prisma.thirdParty.findFirst({
        where: { id: thirdPartyId, userId },
      });
      
      if (!thirdParty) {
        throw new NotFoundException('Third party not found');
      }
    }
  }

  return this.prisma.transaction.create({
    data: {
      ...transactionData,
      userId,
      isThirdParty: isThirdParty || false,
      thirdPartyId,
      thirdPartyName,
      thirdPartyType,
    },
    include: {
      ThirdParty: true,
    },
  });
}

async getThirdPartyTransactionsSummary(userId: string, businessId?: string) {
  const where: any = {
    userId,
    isThirdParty: true,
  };
  
  if (businessId) {
    where.businessId = businessId;
  }

  const [totalAmount, transactionCount, byType] = await Promise.all([
    this.prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    }),
    this.prisma.transaction.count({ where }),
    this.prisma.transaction.groupBy({
      by: ['thirdPartyType'],
      where,
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  return {
    totalAmount: totalAmount._sum.amount || 0,
    transactionCount,
    byType: byType.map(item => ({
      type: item.thirdPartyType,
      amount: item._sum.amount || 0,
      count: item._count.id,
    })),
  };
}
```

### 3. DTOs and Validation

#### A. Third-Party DTOs
Create `server/src/third-party/dto/`:

```typescript
// create-third-party.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsBoolean } from 'class-validator';

export enum ThirdPartyType {
  CLIENT = 'CLIENT',
  FAMILY = 'FAMILY',
  FRIEND = 'FRIEND',
  BUSINESS_PARTNER = 'BUSINESS_PARTNER',
  OTHER = 'OTHER',
}

export class CreateThirdPartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ThirdPartyType)
  type: ThirdPartyType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  businessId?: string;
}

// update-third-party.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateThirdPartyDto } from './create-third-party.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateThirdPartyDto extends PartialType(CreateThirdPartyDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// get-third-parties-query.dto.ts
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ThirdPartyType } from './create-third-party.dto';

export class GetThirdPartiesQueryDto {
  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsEnum(ThirdPartyType)
  type?: ThirdPartyType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
```

#### B. Update Transaction DTOs
Modify `server/src/transactions/dto/create-transaction.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ThirdPartyType } from '../../third-party/dto/create-third-party.dto';

export class CreateTransactionDto {
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  transactionType: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  // Third-party fields
  @IsOptional()
  @IsBoolean()
  isThirdParty?: boolean;

  @IsOptional()
  @IsString()
  thirdPartyName?: string;

  @IsOptional()
  @IsEnum(ThirdPartyType)
  thirdPartyType?: ThirdPartyType;

  @IsOptional()
  @IsString()
  thirdPartyId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### 4. Frontend Implementation

#### A. Third-Party Management Components
Create React components for third-party management:

1. **ThirdPartyList Component** (`src/components/third-party/ThirdPartyList.jsx`):
   - Display all third parties
   - Search and filter functionality
   - Add new third party button
   - Quick actions (edit, delete, view transactions)

2. **ThirdPartyForm Component** (`src/components/third-party/ThirdPartyForm.jsx`):
   - Create/edit third party form
   - All fields with validation
   - Type selection dropdown

3. **ThirdPartyDetails Component** (`src/components/third-party/ThirdPartyDetails.jsx`):
   - Display third party information
   - Show associated transactions
   - Edit and delete actions

#### B. Enhanced Transaction Form
Update `src/components/transactions/TransactionForm.jsx`:

```jsx
// Add third-party section to the form
const [isThirdParty, setIsThirdParty] = useState(false);
const [selectedThirdParty, setSelectedThirdParty] = useState(null);
const [thirdPartyName, setThirdPartyName] = useState('');
const [thirdPartyType, setThirdPartyType] = useState('');

// Add to form JSX
<div className="form-section">
  <label>
    <input
      type="checkbox"
      checked={isThirdParty}
      onChange={(e) => setIsThirdParty(e.target.checked)}
    />
    This transaction is on behalf of someone else
  </label>
  
  {isThirdParty && (
    <div className="third-party-section">
      <div className="form-group">
        <label>Select Third Party:</label>
        <select
          value={selectedThirdParty?.id || ''}
          onChange={(e) => handleThirdPartySelect(e.target.value)}
        >
          <option value="">Select existing or enter new</option>
          {thirdParties.map(tp => (
            <option key={tp.id} value={tp.id}>{tp.name}</option>
          ))}
        </select>
      </div>
      
      {!selectedThirdParty && (
        <>
          <div className="form-group">
            <label>Third Party Name:</label>
            <input
              type="text"
              value={thirdPartyName}
              onChange={(e) => setThirdPartyName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Third Party Type:</label>
            <select
              value={thirdPartyType}
              onChange={(e) => setThirdPartyType(e.target.value)}
              required
            >
              <option value="">Select type</option>
              <option value="CLIENT">Client</option>
              <option value="FAMILY">Family</option>
              <option value="FRIEND">Friend</option>
              <option value="BUSINESS_PARTNER">Business Partner</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </>
      )}
      
      <div className="form-group">
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this third-party transaction"
        />
      </div>
    </div>
  )}
</div>
```

#### C. Transaction List Enhancement
Update `src/components/transactions/TransactionList.jsx` to show third-party indicators:

```jsx
// Add third-party indicator in transaction display
{transaction.isThirdParty && (
  <div className="third-party-indicator">
    <span className="badge">
      On behalf of: {transaction.thirdPartyName || transaction.ThirdParty?.name}
    </span>
    <span className="type-badge">{transaction.thirdPartyType}</span>
  </div>
)}
```

### 5. Services and Hooks

#### A. Third-Party Service
Create `src/services/thirdPartyService.js`:

```javascript
import api from './api';

export const thirdPartyService = {
  getAll: (params = {}) => api.get('/third-party', { params }),
  getById: (id) => api.get(`/third-party/${id}`),
  create: (data) => api.post('/third-party', data),
  update: (id, data) => api.patch(`/third-party/${id}`, data),
  delete: (id) => api.delete(`/third-party/${id}`),
  getTransactions: (id, page = 1, limit = 20) => 
    api.get(`/third-party/${id}/transactions`, { params: { page, limit } }),
  getStats: (businessId) => api.get('/third-party/stats', { params: { businessId } }),
};
```

#### B. Third-Party Hook
Create `src/hooks/useThirdParty.js`:

```javascript
import { useState, useEffect } from 'react';
import { thirdPartyService } from '../services/thirdPartyService';

export const useThirdParty = () => {
  const [thirdParties, setThirdParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchThirdParties = async (params = {}) => {
    setLoading(true);
    try {
      const response = await thirdPartyService.getAll(params);
      setThirdParties(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createThirdParty = async (data) => {
    try {
      const response = await thirdPartyService.create(data);
      setThirdParties(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateThirdParty = async (id, data) => {
    try {
      const response = await thirdPartyService.update(id, data);
      setThirdParties(prev => 
        prev.map(tp => tp.id === id ? response.data : tp)
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteThirdParty = async (id) => {
    try {
      await thirdPartyService.delete(id);
      setThirdParties(prev => prev.filter(tp => tp.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchThirdParties();
  }, []);

  return {
    thirdParties,
    loading,
    error,
    fetchThirdParties,
    createThirdParty,
    updateThirdParty,
    deleteThirdParty,
  };
};
```

### 6. Reporting and Analytics

#### A. Third-Party Reports
Add reporting capabilities for third-party transactions:

1. **Third-Party Transaction Summary**: Total amounts and counts by third party
2. **Third-Party Type Analysis**: Breakdown by client, family, etc.
3. **Third-Party Activity Report**: Recent transactions for each third party
4. **Outstanding Third-Party Balances**: If tracking balances owed to/from third parties

#### B. Dashboard Integration
Add third-party widgets to the dashboard:
- Recent third-party transactions
- Top third parties by transaction volume
- Third-party transaction alerts

### 7. Security and Permissions

#### A. Data Access Control
- Ensure users can only access their own third-party records
- Business-scoped third-party access
- Proper validation of third-party ownership

#### B. Audit Trail
- Track creation, modification, and deletion of third-party records
- Log third-party transaction associations
- Maintain history of third-party changes

### 8. Integration Points

#### A. Journal Entry Integration
- Include third-party information in journal entries
- Third-party context in accounting reports
- Proper categorization of third-party transactions

#### B. PDF Statement Processing
- Automatically detect potential third-party transactions
- Suggest third-party tagging during import
- Pattern recognition for recurring third-party transactions

### 9. Implementation Priority

1. **Phase 1**: Database schema updates and migrations
2. **Phase 2**: Backend API implementation (service, controller, DTOs)
3. **Phase 3**: Frontend third-party management components
4. **Phase 4**: Enhanced transaction form with third-party tagging
5. **Phase 5**: Reporting and analytics integration
6. **Phase 6**: Dashboard widgets and summary views

This implementation will provide comprehensive third-party transaction tagging capabilities, allowing users to maintain proper records of transactions done on behalf of others while integrating seamlessly with the existing accounting system.

