import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // Verifica se há saldo caso o tipo de entrada seja "outcome"
    const transactions = transactionsRepository.getBalance();
    const totalBalance = (await transactions).total;

    if (type === 'outcome' && value > totalBalance) {
      throw new AppError('You dont have enought balance for this operation!');
    }

    let categoryId;

    const categoriesRepository = getRepository(Category);

    const checkIfCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!checkIfCategoryExists) {
      const createNewCategory = categoriesRepository.create({
        title: category,
      });

      const newCategory = await categoriesRepository.save(createNewCategory);

      categoryId = newCategory.id;
    } else {
      categoryId = checkIfCategoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
