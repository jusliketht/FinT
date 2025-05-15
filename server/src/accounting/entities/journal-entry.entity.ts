import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Account } from './account.entity';
import { User } from '../../users/entities/user.entity';

export enum JournalEntryStatus {
  Draft = 'draft',
  Posted = 'posted',
  Void = 'void'
}

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  entryNumber: string;

  @Column('date')
  date: Date;

  @Column({ length: 500 })
  description: string;

  @OneToMany(() => JournalEntryLine, line => line.journalEntry, { cascade: true, eager: true })
  lines: JournalEntryLine[];

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ type: 'enum', enum: JournalEntryStatus, default: JournalEntryStatus.Draft })
  status: JournalEntryStatus;

  @Column('timestamp', { nullable: true })
  postingDate: Date;

  @Column('jsonb', { nullable: true })
  attachments: Array<{ filename: string; path: string; mimetype: string; }>;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateEntry() {
    const totalDebit = this.lines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = this.lines.reduce((sum, line) => sum + Number(line.credit), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error('Total debits must equal total credits');
    }
    if (totalDebit === 0 && totalCredit === 0) {
      throw new Error('Entry must have at least one debit and one credit');
    }
  }

  @BeforeInsert()
  async generateEntryNumber() {
    const lastEntry = await JournalEntry.findOne({ order: { entryNumber: 'DESC' } });
    const lastNumber = lastEntry ? parseInt(lastEntry.entryNumber.split('-')[1]) : 0;
    this.entryNumber = `JE-${(lastNumber + 1).toString().padStart(6, '0')}`;
  }

  async post(): Promise<void> {
    if (this.status === JournalEntryStatus.Posted) {
      throw new Error('Entry is already posted');
    }
    for (const line of this.lines) {
      const account = line.account;
      if (line.debit > 0) {
        await account.updateBalance(Number(line.debit), 'debit');
      }
      if (line.credit > 0) {
        await account.updateBalance(Number(line.credit), 'credit');
      }
    }
    this.status = JournalEntryStatus.Posted;
    this.postingDate = new Date();
  }

  async void(): Promise<void> {
    if (this.status !== JournalEntryStatus.Posted) {
      throw new Error('Only posted entries can be voided');
    }
    for (const line of this.lines) {
      const account = line.account;
      if (line.debit > 0) {
        await account.updateBalance(Number(line.debit), 'credit');
      }
      if (line.credit > 0) {
        await account.updateBalance(Number(line.credit), 'debit');
      }
    }
    this.status = JournalEntryStatus.Void;
  }

  static async findOne(options: any) {
    // This is a placeholder. In a real implementation, you would use TypeORM's repository.
    return null;
  }
}

@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { eager: true })
  @JoinColumn()
  account: Account;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  debit: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  credit: number;

  @ManyToOne(() => JournalEntry, entry => entry.lines)
  journalEntry: JournalEntry;
} 