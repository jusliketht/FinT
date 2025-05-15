const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get general ledger entries
 * @route   GET /api/ledgers/general
 * @access  Private
 */
const getGeneralLedger = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    accountId, 
    description,
    page = 1, 
    limit = 25 
  } = req.query;

  // Build where clause based on provided filters
  const where = {};

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  if (accountId) {
    where.accountId = accountId;
  }

  if (description) {
    where.description = {
      contains: description,
      mode: 'insensitive'
    };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    // Get total count for pagination
    const totalCount = await prisma.ledgerEntry.count({ where });

    // Get entries with pagination
    const entries = await prisma.ledgerEntry.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { journalId: 'asc' },
      ],
      include: {
        account: true,
        journal: {
          select: {
            reference: true,
            status: true
          }
        }
      },
      skip,
      take,
    });

    // Format entries
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      date: entry.date,
      journalId: entry.journalId,
      accountId: entry.accountId,
      accountCode: entry.account?.code,
      accountName: entry.account?.name,
      description: entry.description,
      debitAmount: entry.debitAmount,
      creditAmount: entry.creditAmount,
      balance: entry.balance,
      reference: entry.journal?.reference,
      status: entry.journal?.status
    }));

    res.json({
      data: formattedEntries,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error retrieving general ledger:', error);
    res.status(500);
    throw new Error('Failed to retrieve general ledger entries');
  }
});

/**
 * @desc    Get account ledger entries
 * @route   GET /api/ledgers/account/:accountId
 * @access  Private
 */
const getAccountLedger = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const { 
    startDate, 
    endDate, 
    page = 1, 
    limit = 25 
  } = req.query;

  // Build where clause
  const where = {
    accountId: accountId
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  try {
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total count for pagination
    const totalCount = await prisma.ledgerEntry.count({ where });

    // Get entries with pagination
    const entries = await prisma.ledgerEntry.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { journalId: 'asc' },
      ],
      include: {
        journal: {
          select: {
            reference: true,
            description: true,
            status: true
          }
        }
      },
      skip,
      take,
    });

    // Fetch account info
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        code: true,
        name: true
      }
    });

    res.json({
      account,
      data: entries,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error retrieving account ledger:', error);
    res.status(500);
    throw new Error('Failed to retrieve account ledger entries');
  }
});

/**
 * @desc    Get trial balance
 * @route   GET /api/ledgers/trial-balance
 * @access  Private
 */
const getTrialBalance = asyncHandler(async (req, res) => {
  const { asOfDate, includeZeroBalances = 'false' } = req.query;
  const showZeroBalances = includeZeroBalances === 'true';

  try {
    // Get all accounts
    const accounts = await prisma.account.findMany({
      where: {
        active: true
      },
      include: {
        accountType: true,
      }
    });

    // For each account, calculate the balance as of the given date
    const trialBalancePromises = accounts.map(async account => {
      const where = {
        accountId: account.id,
      };

      if (asOfDate) {
        where.date = {
          lte: new Date(asOfDate)
        };
      }

      // Sum debits and credits
      const entries = await prisma.ledgerEntry.findMany({
        where,
        select: {
          debitAmount: true,
          creditAmount: true
        }
      });

      const totalDebits = entries.reduce((sum, entry) => sum + parseFloat(entry.debitAmount || 0), 0);
      const totalCredits = entries.reduce((sum, entry) => sum + parseFloat(entry.creditAmount || 0), 0);

      // Calculate net amount (positive for debit balance, negative for credit balance)
      const netAmount = totalDebits - totalCredits;

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.accountType?.name || 'Unknown',
        debitBalance: netAmount > 0 ? Math.abs(netAmount) : 0,
        creditBalance: netAmount < 0 ? Math.abs(netAmount) : 0
      };
    });

    let trialBalance = await Promise.all(trialBalancePromises);

    // Filter out zero balances if not including them
    if (!showZeroBalances) {
      trialBalance = trialBalance.filter(
        account => account.debitBalance > 0 || account.creditBalance > 0
      );
    }

    // Calculate totals
    const totalDebits = trialBalance.reduce((sum, account) => sum + account.debitBalance, 0);
    const totalCredits = trialBalance.reduce((sum, account) => sum + account.creditBalance, 0);

    res.json({
      data: trialBalance,
      totals: {
        debitTotal: totalDebits,
        creditTotal: totalCredits,
        difference: Math.abs(totalDebits - totalCredits)
      }
    });
  } catch (error) {
    console.error('Error generating trial balance:', error);
    res.status(500);
    throw new Error('Failed to generate trial balance');
  }
});

/**
 * @desc    Post a journal entry
 * @route   POST /api/ledgers/journal-entries
 * @access  Private
 */
const postJournalEntry = asyncHandler(async (req, res) => {
  const { date, description, reference, items } = req.body;

  // Validation
  if (!date || !description || !items || !Array.isArray(items) || items.length < 2) {
    res.status(400);
    throw new Error('Journal entries must include date, description, and at least two line items');
  }

  // Validate total debits equals total credits
  const totalDebits = items.reduce((sum, item) => sum + (parseFloat(item.debitAmount) || 0), 0);
  const totalCredits = items.reduce((sum, item) => sum + (parseFloat(item.creditAmount) || 0), 0);

  if (Math.abs(totalDebits - totalCredits) > 0.01) { // Allow for tiny rounding errors
    res.status(400);
    throw new Error('Total debits must equal total credits');
  }

  try {
    // Begin transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create journal entry
      const journal = await prisma.journalEntry.create({
        data: {
          date: new Date(date),
          description,
          reference: reference || `JE-${Date.now()}`,
          status: 'POSTED',
          createdBy: req.user.id,
        }
      });

      // Create ledger entries for each line item
      const ledgerEntries = [];
      for (const item of items) {
        const ledgerEntry = await prisma.ledgerEntry.create({
          data: {
            journalId: journal.id,
            accountId: item.accountId,
            date: new Date(date),
            description: item.description || description,
            debitAmount: parseFloat(item.debitAmount) || 0,
            creditAmount: parseFloat(item.creditAmount) || 0,
          }
        });
        ledgerEntries.push(ledgerEntry);
      }

      // Update account balances
      const affectedAccountIds = [...new Set(items.map(item => item.accountId))];
      
      for (const accountId of affectedAccountIds) {
        await updateAccountBalance(prisma, accountId);
      }

      return {
        journal,
        ledgerEntries
      };
    });

    res.status(201).json({
      success: true,
      journalId: result.journal.id,
      reference: result.journal.reference,
      date: result.journal.date,
      description: result.journal.description
    });
  } catch (error) {
    console.error('Error posting journal entry:', error);
    res.status(500);
    throw new Error('Failed to post journal entry');
  }
});

/**
 * @desc    Get a single journal entry by ID
 * @route   GET /api/ledgers/journal-entries/:id
 * @access  Private
 */
const getJournalEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Get journal entry
    const journal = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!journal) {
      res.status(404);
      throw new Error('Journal entry not found');
    }

    // Get associated ledger entries
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { journalId: id },
      include: {
        account: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: [
        { debitAmount: 'desc' },
        { creditAmount: 'desc' }
      ]
    });

    res.json({
      id: journal.id,
      date: journal.date,
      description: journal.description,
      reference: journal.reference,
      status: journal.status,
      createdAt: journal.createdAt,
      createdBy: journal.createdByUser,
      items: ledgerEntries.map(entry => ({
        id: entry.id,
        accountId: entry.accountId,
        accountCode: entry.account?.code,
        accountName: entry.account?.name,
        description: entry.description,
        debitAmount: entry.debitAmount,
        creditAmount: entry.creditAmount
      }))
    });
  } catch (error) {
    console.error('Error retrieving journal entry:', error);
    res.status(500);
    throw new Error('Failed to retrieve journal entry');
  }
});

/**
 * @desc    Get all journal entries
 * @route   GET /api/ledgers/journal-entries
 * @access  Private
 */
const getAllJournalEntries = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    description, 
    page = 1, 
    limit = 25 
  } = req.query;

  // Build where clause based on provided filters
  const where = {};

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  if (description) {
    where.description = {
      contains: description,
      mode: 'insensitive'
    };
  }

  try {
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total count for pagination
    const totalCount = await prisma.journalEntry.count({ where });

    // Get entries with pagination
    const journalEntries = await prisma.journalEntry.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        },
        ledgerEntries: {
          include: {
            account: true
          }
        }
      },
      skip,
      take
    });

    // Format and summarize journal entries
    const formattedEntries = journalEntries.map(journal => {
      const totalAmount = journal.ledgerEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.debitAmount || 0), 
        0
      );

      return {
        id: journal.id,
        date: journal.date,
        reference: journal.reference,
        description: journal.description,
        status: journal.status,
        totalAmount,
        createdAt: journal.createdAt,
        createdBy: journal.createdByUser?.name,
        entriesCount: journal.ledgerEntries.length
      };
    });

    res.json({
      data: formattedEntries,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error retrieving journal entries:', error);
    res.status(500);
    throw new Error('Failed to retrieve journal entries');
  }
});

/**
 * Helper function to update account balance from ledger entries
 */
const updateAccountBalance = async (prismaClient, accountId) => {
  // Get all ledger entries for this account, ordered by date
  const entries = await prismaClient.ledgerEntry.findMany({
    where: { accountId },
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  // Calculate running balance
  let balance = 0;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    balance += parseFloat(entry.debitAmount || 0) - parseFloat(entry.creditAmount || 0);
    
    // Update this entry's balance
    await prismaClient.ledgerEntry.update({
      where: { id: entry.id },
      data: { balance }
    });
  }

  // Update the account's current balance
  await prismaClient.account.update({
    where: { id: accountId },
    data: { currentBalance: balance }
  });

  return balance;
};

module.exports = {
  getGeneralLedger,
  getAccountLedger,
  getTrialBalance,
  postJournalEntry,
  getJournalEntry,
  getAllJournalEntries
}; 