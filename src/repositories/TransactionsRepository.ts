import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface ReturnDataDTO {
  transactions: Transaction[];

  balance: Balance;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<ReturnDataDTO> {
    const transactions = await this.find();
    const balance = await this.getBalance();

    const returnData: ReturnDataDTO = {
      transactions,
      balance,
    };

    return returnData;
  }

  public async getBalance(): Promise<Balance> {
    let income = 0;
    let outcome = 0;

    const incomeTransactions = await this.find({
      where: { type: 'income' },
    });

    // eslint-disable-next-line no-return-assign
    incomeTransactions.map(transaction => (income += transaction.value));

    const outcomeTransactions = await this.find({
      where: { type: 'outcome' },
    });

    // eslint-disable-next-line no-return-assign
    outcomeTransactions.map(transaction => (outcome += transaction.value));

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
