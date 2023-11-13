export enum DatabaseOperationError {
  SQL_ERROR = 'SQL_ERROR',
  UNIQUE_VIOLATION = 'UNIQUE_VIOLATION',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface SqliteError extends Error {
  errno: number;
  code: string;
}

export class DatabaseError extends Error {
  public errorCode: DatabaseOperationError;

  constructor(errorCode: DatabaseOperationError, message?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.errorCode = errorCode;
  }
}

function isSqliteError(error: unknown): error is SqliteError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function handleDatabaseError(error: unknown): never {
  if (isSqliteError(error)) {
    let errorCode: DatabaseOperationError;
    console.error(`[SQLITE ERROR] ${error.message}`);
    switch (error.code) {
    case 'SQLITE_CONSTRAINT':
      errorCode = DatabaseOperationError.UNIQUE_VIOLATION;
      break;
    case 'SQLITE_NOTFOUND':
      errorCode = DatabaseOperationError.NOT_FOUND;
      break;
    default:
      errorCode = DatabaseOperationError.UNKNOWN;
    }
    throw new DatabaseError(errorCode, error.message);
  } else {
    // Optionally handle non-SQLite errors differently
    throw error;
  }
}
