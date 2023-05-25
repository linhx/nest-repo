export interface Transaction {}

export interface Db {
  withTransaction(
    transaction: Transaction,
    callback: (transaction: Transaction) => Promise<any>
  );
}

export interface TransactionStore {
  getTransaction(): Transaction;
  existsUuid(uuid: string): boolean;
}
