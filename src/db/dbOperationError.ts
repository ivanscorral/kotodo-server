export enum DBOperationError {
  UnknownError = 'UNKNOWN_ERROR',
  ConstraintViolation = 'CONSTRAINT_VIOLATION',
  NotFound = 'NOT_FOUND',
  DatabaseError = 'DATABASE_ERROR',
  ConnectionError = 'CONNECTION_ERROR',
  StatementError = 'STATEMENT_ERROR',
  TransactionError = 'TRANSACTION_ERROR',
}
