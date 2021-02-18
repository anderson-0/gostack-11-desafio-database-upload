import { Request, Response, Router } from 'express';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

// import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (req: Request, res: Response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = transactionRepository.getBalance();

  return res.json({ transactions, balance });
});

transactionsRouter.post('/', async (req: Request, res: Response) => {
  const { title, value, type, category } = req.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req: Request, res: Response) => {
  // TODO
});

transactionsRouter.post('/import', async (req: Request, res: Response) => {
  // TODO
});

export default transactionsRouter;
