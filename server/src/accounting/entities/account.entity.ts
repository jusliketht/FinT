import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum AccountType {
  Asset = 'Asset',
  Liability = 'Liability',
  Equity = 'Equity',
  Revenue = 'Revenue',
  Expense = 'Expense'
}

export enum NormalBalance {
  Debit = 'debit',
  Credit = 'credit'
}

@Entity('accounts')
@Tree('closure-table')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: AccountType
  })
  type: AccountType;

  @Column({ length: 50, nullable: true })
  subtype: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: NormalBalance
  })
  normalBalance: NormalBalance;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: false })
  isSubledger: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('int')
  fiscalYear: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @TreeChildren()
  children: Account[];

  @TreeParent()
  parent: Account;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  getCurrentBalance(): number {
    return this.normalBalance === NormalBalance.Debit ? Number(this.balance) : -Number(this.balance);
  }

  async updateBalance(amount: number, type: 'debit' | 'credit'): Promise<void> {
    const multiplier = type === 'debit' ? 1 : -1;
    this.balance = Number(this.balance) + (amount * multiplier);
  }

  getFullPath(): string {
    return this.parent ? `${this.parent.getFullPath()} > ${this.name}` : this.name;
  }
} 