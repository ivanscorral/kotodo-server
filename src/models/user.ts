import { FilterBuilder, SQLiteWrapper, FilterCondition, FilterGroup, FilterType } from "../db/sqlite_wrapper";


export const tableName: string = 'users';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
