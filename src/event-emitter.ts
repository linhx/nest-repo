import { CommitEvent } from './decorators/transactional.interface';

export interface TransactionalEventEmitter {
  emit(arg: CommitEvent): boolean;
  onCommitted(listener: (arg: CommitEvent) => void): this;
}

export const TRANSACTIONAL_EVENT_EMITTER_PROVIDER = Symbol(
  'TRANSACTIONAL_EVENT_EMITTER_PROVIDER'
);
