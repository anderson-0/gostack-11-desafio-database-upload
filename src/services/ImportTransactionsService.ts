import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    const dataReadStream = fs.createReadStream(filePath);

    const parser = csvParse({
      fromLine: 2,
    });

    const csvParserData = dataReadStream.pipe(parser);

    csvParserData.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => {
        return cell.trim();
      });

      if (!title || !type || !value) {
        return;
      }

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => csvParserData.on('end', resolve));

    const existingCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const categoriesTitles = existingCategories.map((category: Category) => {
      return category.title;
    });

    const filterNotExistingCategories = categories
      .filter(category => !categoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      filterNotExistingCategories.map((title: string) => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const listOfCategories = [...newCategories, ...existingCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map((transaction: CSVTransaction) => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: listOfCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
