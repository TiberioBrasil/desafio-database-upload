import path from 'path';
import fs from 'fs';
// import * as csv from 'fast-csv';
import csv from 'csvtojson';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}
interface TransactionObject {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const transactions: Array<Transaction> = [];
    let CSVtoJSON: Array<TransactionObject>;

    const filePath = path.join(uploadConfig.directory, filename);

    if (!(await fs.promises.stat(filePath))) {
      throw new AppError('CSV File not found');
    }

    await csv()
      .fromFile(filePath)
      .then(jsonData => {
        CSVtoJSON = jsonData;
      });

    await fs.promises.unlink(filePath);

    const forLoop = async (): Promise<void> => {
      for (let index = 0; index < CSVtoJSON.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        const transaction = await createTransaction.execute(CSVtoJSON[index]);
        transactions.push(transaction);
      }
    };

    await forLoop();

    return transactions;
  }
}

export default ImportTransactionsService;
