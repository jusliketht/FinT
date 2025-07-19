import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCreditCardDto, UpdateCreditCardDto } from '../dto';

const prisma = new PrismaClient();

@Injectable()
export class CreditCardsService {

  async create(createCreditCardDto: CreateCreditCardDto, userId: string) {
    return prisma.creditCard.create({
      data: {
        ...createCreditCardDto,
        userId,
        creditLimit: parseFloat(createCreditCardDto.creditLimit.toString()),
        outstandingAmount: 0, // Default to 0 for new cards
      },
    });
  }

  async findAll(userId: string) {
    return prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return prisma.creditCard.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, updateCreditCardDto: UpdateCreditCardDto, userId: string) {
    const data: any = { ...updateCreditCardDto };
    
    if (updateCreditCardDto.creditLimit) {
      data.creditLimit = parseFloat(updateCreditCardDto.creditLimit.toString());
    }

    return prisma.creditCard.update({
      where: { id, userId },
      data,
    });
  }

  async remove(id: string, userId: string) {
    return prisma.creditCard.delete({
      where: { id, userId },
    });
  }

  async getTransactions(cardId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      prisma.creditCardTransaction.findMany({
        where: { 
          creditCardId: cardId,
          creditCard: { userId }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          creditCard: {
            select: {
              cardName: true,
              bankName: true,
            }
          }
        }
      }),
      prisma.creditCardTransaction.count({
        where: { 
          creditCardId: cardId,
          creditCard: { userId }
        }
      })
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async addTransaction(cardId: string, transactionData: any, userId: string) {
    // Verify the card belongs to the user
    const card = await this.findOne(cardId, userId);
    if (!card) {
      throw new Error('Credit card not found');
    }

    const transaction = await prisma.creditCardTransaction.create({
      data: {
        ...transactionData,
        creditCardId: cardId,
        amount: parseFloat(transactionData.amount.toString()),
      },
    });

    // Update the outstanding amount on the card
    await this.updateOutstandingAmount(cardId);

    return transaction;
  }

  private async updateOutstandingAmount(cardId: string) {
    const transactions = await prisma.creditCardTransaction.findMany({
      where: { creditCardId: cardId },
    });

    const totalOutstanding = transactions.reduce((sum, transaction) => {
      if (transaction.type === 'DEBIT') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    }, 0);

    await prisma.creditCard.update({
      where: { id: cardId },
      data: { outstandingAmount: totalOutstanding },
    });
  }

  async getSummary(userId: string) {
    const cards = await this.findAll(userId);
    
    const totalCreditLimit = cards.reduce((sum, card) => sum + (card.creditLimit || 0), 0);
    const totalOutstanding = cards.reduce((sum, card) => sum + (card.outstandingAmount || 0), 0);
    const utilizationRate = totalCreditLimit > 0 ? (totalOutstanding / totalCreditLimit) * 100 : 0;

    return {
      totalCards: cards.length,
      totalCreditLimit,
      totalOutstanding,
      utilizationRate,
      availableCredit: totalCreditLimit - totalOutstanding,
    };
  }
} 