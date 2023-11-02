import { FilterBuilder, SQLiteWrapper, FilterCondition, FilterGroup, FilterType } from "../db/sqlite_wrapper";



export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
