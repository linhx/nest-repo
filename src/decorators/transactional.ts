import { DB_PROVIDER } from '../constants';
import { TransactionStore } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_STORE, transactionStore } from '../transaction-store';
import { TRANSACTIONAL_OPTIONS, TRANSACTIONAL_WATERMARK } from '../constants';
import { Inject } from '@nestjs/common';
import { TransactionalOptions } from './transactional.interface';
import {
  TRANSACTIONAL_EVENT_EMITTER_PROVIDER,
  TransactionalEventEmitter,
} from '../event-emitter';

const OVERRIDDEN_TRANSACTIONAL_WATERMARK = Symbol(
  'OVERRIDDEN_TRANSACTIONAL_WATERMARK'
);
const INJECT_DB_WATERMARK = Symbol('INJECT_DB_WATERMARK');
const INJECT_EVENT_EMITTER_WATERMARK = Symbol('INJECT_EVENT_EMITTER_WATERMARK');

// eslint-disable-next-line @typescript-eslint/ban-types
export const overrideTransactionalMethods = (target: Function) => {
  const proto = (target as any).prototype;

  const propertiesName = Object.getOwnPropertyNames(proto);
  for (const propertyName of propertiesName) {
    if (propertyName === 'constructor') {
      continue;
    }
    const desc = Object.getOwnPropertyDescriptor(proto, propertyName);

    const alreadyOverride: boolean = Reflect.getOwnMetadata(
      OVERRIDDEN_TRANSACTIONAL_WATERMARK,
      proto,
      propertyName
    );
    if (alreadyOverride) {
      break;
    }
    Reflect.defineMetadata(
      OVERRIDDEN_TRANSACTIONAL_WATERMARK,
      true, // set alreadyCreated
      proto,
      propertyName
    );

    const isTransactionalMethod: boolean = Reflect.getOwnMetadata(
      TRANSACTIONAL_WATERMARK,
      proto,
      propertyName
    );

    const metadatas = Reflect.getMetadataKeys(desc.value).map((key) => {
      return [key, Reflect.getMetadata(key, desc.value)];
    });
    if (isTransactionalMethod) {
      overrideTrxMethod(proto, desc, propertyName);
    } else {
      overrideNonTrxMethod(proto, desc);
    }
    Object.defineProperty(proto, propertyName, desc);
    // redefine the old metadata of the method since the desc.value was changed
    metadatas.forEach((metadata) => {
      Reflect.defineMetadata(metadata[0], metadata[1], desc.value);
    });
  }
};

const genTrxUuid = (transactionStore: TransactionStore) => {
  for (let i = 0; i < 10; i++) {
    const trxUuid = uuidv4();
    if (!transactionStore.existsUuid(trxUuid)) {
      return trxUuid;
    }
  }
  throw new Error('Can not create transaction uuid');
};

const injectNeededDependencies = (target: Record<string, any>) => {
  if (!Reflect.getMetadata(INJECT_DB_WATERMARK, target)) {
    Inject(DB_PROVIDER)(target, '_db_');
    Reflect.defineMetadata(INJECT_DB_WATERMARK, true, target);
  }
  if (!Reflect.getMetadata(INJECT_EVENT_EMITTER_WATERMARK, target)) {
    Inject(TRANSACTIONAL_EVENT_EMITTER_PROVIDER)(target, '_eventEmitter_');
    Reflect.defineMetadata(INJECT_EVENT_EMITTER_WATERMARK, true, target);
  }
};

const overrideTrxMethod = (
  target: Record<string, any>,
  descriptor: PropertyDescriptor,
  propertyName: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalFunc = descriptor.value!;
  const options: TransactionalOptions = Reflect.getMetadata(
    TRANSACTIONAL_OPTIONS,
    target,
    propertyName
  );
  injectNeededDependencies(target);
  descriptor.value = function (...args) {
    let trxUuid = transactionStore.getStore() as string;
    if (
      !trxUuid ||
      !TRANSACTION_STORE.hasTransaction(trxUuid) ||
      options?.new
    ) {
      trxUuid = genTrxUuid(TRANSACTION_STORE);
      return transactionStore.run(trxUuid, async () => {
        let committed = false;
        try {
          const res = await this._db_.withTransaction(null, (_trx) => {
            TRANSACTION_STORE.set(trxUuid, _trx); // add transaction to the store
            return originalFunc.apply(this, args);
          });
          TRANSACTION_STORE.remove(trxUuid); // remove the transaction from the store
          committed = true;
          return res;
        } finally {
          // send event committed
          if (!options?.noEmitCommittedEvent) {
            (this._eventEmitter_ as TransactionalEventEmitter)?.emit({
              trxUuid,
              committed,
            });
          }
        }
      });
    }
    return originalFunc.apply(this, args);
  };
};

const overrideNonTrxMethod = (
  target: Record<string, any>,
  descriptor?: PropertyDescriptor
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originalFunc = descriptor.value!;
  descriptor.value = function (...args) {
    const trxUuid = genTrxUuid(TRANSACTION_STORE);
    return transactionStore.run(trxUuid, () => {
      TRANSACTION_STORE.set(trxUuid, null); // add transaction to the store
      const val = originalFunc.apply(this, args);
      TRANSACTION_STORE.remove(trxUuid); // remove the transaction from the store
      return val;
    });
  };
};
