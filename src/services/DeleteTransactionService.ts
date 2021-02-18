import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transaction = transactionRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Invalid Transaction ID');
    }
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
