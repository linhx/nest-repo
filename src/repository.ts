import { PagingDto } from '@linhx/rest-common';
import { Transaction } from './db';

export interface Repository<T, U> {
  create(trx: Transaction, t: T): Promise<T>;
  update(trx: Transaction, t: T): Promise<T>;
  save(trx: Transaction, t: T): Promise<T>;
  saveAll(trx: Transaction, t: T[]): Promise<T[]>;
  delete(trx: Transaction, t: T): Promise<T>;
  deleteAll(trx: Transaction): Promise<void>;
  deleteById(trx: Transaction, id: U): Promise<void>;
  deleteAllById(trx: Transaction, ids: U[]): Promise<void>;
  existsById(trx: Transaction, id: U): Promise<boolean>;
  findAll(
    trx: Transaction,
    condition?: Partial<T>,
    paging?: PagingDto,
  ): Promise<T[]>;
  findAllById(trx: Transaction, ids: U[]): Promise<T[]>;
  findById(trx: Transaction, id: U): Promise<T>;
  count(trx: Transaction, condition?: Partial<T>): Promise<number>;
}
