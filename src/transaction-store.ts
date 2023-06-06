import {
  TransactionStore as ITransactionStore,
  Transaction,
} from './db';
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuidv4 } from 'uuid';

export const transactionStore = new AsyncLocalStorage();

class TransactionStore implements ITransactionStore {
  private store = new Map<string, Transaction | undefined>();

  getTransaction(): Transaction {
    const trxUuid = transactionStore.getStore() as string;
    return this.store.get(trxUuid);
  }

  getTransactionUuid() {
    return transactionStore.getStore() as string;
  }

  existsUuid(uuid: string): boolean {
    return this.store.has(uuid);
  }

  set(trxUUid: string, trx: Transaction) {
    this.store.set(trxUUid, trx);
  }

  remove(trxUUid: string) {
    this.store.delete(trxUUid);
  }

  hasTransaction(trxUuid: string) {
    const trx = this.store.get(trxUuid);
    return trx !== null && trx !== undefined;
  }
}

export const TRANSACTION_STORE = new TransactionStore();

export const execAsyncTransactionalMethod = (callback: () => any) => {
  const trxUuid = uuidv4();
  return transactionStore.run(trxUuid, () => {
    TRANSACTION_STORE.set(trxUuid, null); // add transaction to the store
    const val = callback();
    TRANSACTION_STORE.remove(trxUuid); // remove the transaction from the store
    return val;
  });
};
