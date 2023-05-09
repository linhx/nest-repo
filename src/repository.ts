import { PagingDto } from '@linhx/rest-common';

export interface Repository<T, U> {
  create(t: T): Promise<T>;
  update(t: T): Promise<T>;
  save(t: T): Promise<T>;
  saveAll(t: T[]): Promise<T[]>;
  delete(t: T): Promise<T>;
  deleteAll(): Promise<void>;
  deleteById(id: U): Promise<void>;
  deleteAllById(ids: U[]): Promise<void>;
  existsById(id: U): Promise<boolean>;
  findAll(
    condition?: Partial<T>,
    paging?: PagingDto,
  ): Promise<T[]>;
  findAllById(ids: U[]): Promise<T[]>;
  findById(id: U): Promise<T>;
  count(condition?: Partial<T>): Promise<number>;
}
