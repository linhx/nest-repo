export type TransactionalOptions = {
  /**
   * Don't emit event when the transaction is completed (either committed or rollback)
   */
  noEmitCommittedEvent?: boolean;
  /**
   * Start a whole new transaction even if there is another transaction is wrapping the method
   */
  new?: boolean;
};

export type CommitEvent = {
  trxUuid: string;
  committed: boolean;
};
