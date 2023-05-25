import { PagingDto } from '@linhx/rest-common';

export interface DeleteResult {
  deletedCount: number;
}

export interface Repository<T, U> {
  create(t: T): Promise<T>;
  update(t: T): Promise<T>;
  save(t: T): Promise<T>;
  saveAll(t: T[]): Promise<T[]>;
  delete(t: T): Promise<T>;
  deleteMany(t: Partial<T>): Promise<DeleteResult>;
  deleteAll(): Promise<DeleteResult>;
  deleteById(id: U): Promise<void>;
  deleteAllById(ids: U[]): Promise<DeleteResult>;
  existsById(id: U): Promise<boolean>;
  findAll(condition?: Partial<T>, paging?: PagingDto): Promise<T[]>;
  findAllById(ids: U[]): Promise<T[]>;
  findById(id: U): Promise<T>;
  count(condition?: Partial<T>): Promise<number>;
}
