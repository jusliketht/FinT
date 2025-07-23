import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTransactionDto: CreateTransactionDto = {
      description: 'Test Transaction',
      amount: 1000,
      type: 'income',
      date: new Date('2024-01-15'),
      accountId: '1',
      category: 'Sales',
      reference: 'REF001',
      notes: 'Test notes',
    };

    const mockAccount = {
      id: '1',
      name: 'Cash Account',
      balance: 5000,
      type: 'asset',
    };

    it('should create a transaction successfully', async () => {
      const mockTransaction = {
        id: '1',
        ...createTransactionDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
      mockPrismaService.account.update.mockResolvedValue({ ...mockAccount, balance: 6000 });

      const result = await service.create(createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: createTransactionDto,
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 6000 },
      });
    });

    it('should handle expense transactions correctly', async () => {
      const expenseDto = { ...createTransactionDto, type: 'expense' };
      const mockTransaction = { id: '1', ...expenseDto };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
      mockPrismaService.account.update.mockResolvedValue({ ...mockAccount, balance: 4000 });

      await service.create(expenseDto);

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 4000 }, // 5000 - 1000
      });
    });

    it('should throw error when account not found', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(service.create(createTransactionDto)).rejects.toThrow('Account not found');
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should validate transaction amount', async () => {
      const invalidDto = { ...createTransactionDto, amount: -100 };

      await expect(service.create(invalidDto)).rejects.toThrow('Amount must be positive');
    });
  });

  describe('findAll', () => {
    const queryDto: GetTransactionsQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      type: 'income',
      accountId: '1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const mockTransactions = [
      {
        id: '1',
        description: 'Test Transaction 1',
        amount: 1000,
        type: 'income',
        date: new Date('2024-01-15'),
        account: { id: '1', name: 'Cash Account' },
      },
      {
        id: '2',
        description: 'Test Transaction 2',
        amount: 500,
        type: 'expense',
        date: new Date('2024-01-16'),
        account: { id: '1', name: 'Cash Account' },
      },
    ];

    it('should return paginated transactions', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(2);

      const result = await service.findAll(queryDto);

      expect(result.transactions).toEqual(mockTransactions);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should apply search filter', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(1);

      await service.findAll({ ...queryDto, search: 'Test Transaction 1' });

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          description: { contains: 'Test Transaction 1', mode: 'insensitive' },
        }),
        skip: 0,
        take: 10,
        orderBy: { date: 'desc' },
        include: { account: true },
      });
    });

    it('should apply type filter', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(1);

      await service.findAll({ ...queryDto, type: 'income' });

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          type: 'income',
        }),
        skip: 0,
        take: 10,
        orderBy: { date: 'desc' },
        include: { account: true },
      });
    });

    it('should apply date range filter', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(2);

      await service.findAll(queryDto);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        }),
        skip: 0,
        take: 10,
        orderBy: { date: 'desc' },
        include: { account: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const mockTransaction = {
        id: '1',
        description: 'Test Transaction',
        amount: 1000,
        type: 'income',
        date: new Date('2024-01-15'),
        account: { id: '1', name: 'Cash Account' },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { account: true },
      });
    });

    it('should throw error when transaction not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('Transaction not found');
    });
  });

  describe('update', () => {
    const updateDto = {
      description: 'Updated Transaction',
      amount: 1500,
      notes: 'Updated notes',
    };

    const mockTransaction = {
      id: '1',
      description: 'Test Transaction',
      amount: 1000,
      type: 'income',
      date: new Date('2024-01-15'),
      accountId: '1',
    };

    it('should update a transaction successfully', async () => {
      const updatedTransaction = { ...mockTransaction, ...updateDto };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTransaction);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedTransaction);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw error when transaction not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateDto)).rejects.toThrow('Transaction not found');
    });

    it('should update account balance when amount changes', async () => {
      const mockAccount = { id: '1', balance: 5000 };
      const updatedTransaction = { ...mockTransaction, amount: 1500 };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.transaction.update.mockResolvedValue(updatedTransaction);
      mockPrismaService.account.update.mockResolvedValue({ ...mockAccount, balance: 5500 });

      await service.update('1', { amount: 1500 });

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 5500 }, // 5000 + (1500 - 1000)
      });
    });
  });

  describe('remove', () => {
    const mockTransaction = {
      id: '1',
      description: 'Test Transaction',
      amount: 1000,
      type: 'income',
      date: new Date('2024-01-15'),
      accountId: '1',
    };

    it('should delete a transaction successfully', async () => {
      const mockAccount = { id: '1', balance: 5000 };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.transaction.delete.mockResolvedValue(mockTransaction);
      mockPrismaService.account.update.mockResolvedValue({ ...mockAccount, balance: 4000 });

      const result = await service.remove('1');

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 4000 }, // 5000 - 1000
      });
    });

    it('should throw error when transaction not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow('Transaction not found');
    });

    it('should handle expense transaction deletion correctly', async () => {
      const expenseTransaction = { ...mockTransaction, type: 'expense' };
      const mockAccount = { id: '1', balance: 5000 };

      mockPrismaService.transaction.findUnique.mockResolvedValue(expenseTransaction);
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.transaction.delete.mockResolvedValue(expenseTransaction);
      mockPrismaService.account.update.mockResolvedValue({ ...mockAccount, balance: 6000 });

      await service.remove('1');

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 6000 }, // 5000 + 1000 (reversing expense)
      });
    });
  });

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      const mockStats = {
        totalIncome: 10000,
        totalExpenses: 5000,
        netProfit: 5000,
        transactionCount: 50,
        averageTransaction: 300,
      };

      mockPrismaService.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 10000 },
        _count: { id: 50 },
      });

      mockPrismaService.transaction.findMany.mockResolvedValue([
        { amount: 1000, type: 'income' },
        { amount: 500, type: 'expense' },
      ]);

      const result = await service.getTransactionStats();

      expect(result).toEqual(mockStats);
    });

    it('should handle empty transaction data', async () => {
      mockPrismaService.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: { id: 0 },
      });

      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getTransactionStats();

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        transactionCount: 0,
        averageTransaction: 0,
      });
    });
  });

  describe('getTransactionsByAccount', () => {
    it('should return transactions for a specific account', async () => {
      const mockTransactions = [
        { id: '1', description: 'Transaction 1', amount: 1000 },
        { id: '2', description: 'Transaction 2', amount: 500 },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.getTransactionsByAccount('1');

      expect(result).toEqual(mockTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { accountId: '1' },
        orderBy: { date: 'desc' },
        include: { account: true },
      });
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('should return transactions within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockTransactions = [
        { id: '1', description: 'Transaction 1', date: new Date('2024-01-15') },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.getTransactionsByDateRange(startDate, endDate);

      expect(result).toEqual(mockTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
        include: { account: true },
      });
    });
  });
}); 