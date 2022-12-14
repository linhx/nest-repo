export interface Transaction {}

export interface Db {
  withTransaction(
    transaction: Transaction,
    callback: (transaction: Transaction) => Promise<any>
  );
}
