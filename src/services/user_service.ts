/* eslint-disable @typescript-eslint/no-explicit-any */
import { SQLiteWrapper } from '../db/sqlite_wrapper';
import { User } from '../models/user';
import * as bcrypt from 'bcrypt';
import { FilterBuilder, FilterType } from '../db/sqlite_wrapper';
export class UserModel implements User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
    
  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}


export interface NewUserPayload {
    name: string;
    email: string;
    passwordHash: string;
}

export class UserService {
  public static TABLE_NAME = 'users';
  private db?: SQLiteWrapper;

  public async build(): Promise<void> {
    this.db = new SQLiteWrapper('db/kotodo.db');
    await this.db.create();
  }
  
  public async getByNameOrEmail(name?: string, email?: string): Promise<UserModel> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const filterBuilder = new FilterBuilder();
    if (name) filterBuilder.addCondition('name', name, FilterType.EQUAL);
    if (email) filterBuilder.addCondition('email', email, FilterType.EQUAL);
  
    const users = await this.db.selectAll(UserService.TABLE_NAME, filterBuilder);
    if (users.length === 0) {
      throw new Error('User not found');
    }
  
    return new UserModel(users[0]);
  }
  

  public async insert(name: string, email: string, password: string): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const passwordHash = await this.hashPassword(password);
    return await this.db?.insert(UserService.TABLE_NAME, { name, email, passwordHash });
  }

  public async get(userId: number): Promise<UserModel> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const user = await this.db.selectAll(
      UserService.TABLE_NAME,
      new FilterBuilder().addCondition('id', userId, FilterType.EQUAL),
    );
    return user[0];
  }

  public async update(
    userId: number,
    name?: string,
    email?: string,
    password?: string,
  ): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.passwordHash = await this.hashPassword(password);
        
    if (Object.keys(updateData).length) {
      updateData.updatedAt = new Date().toISOString();
    }
    await this.db.update(
      UserService.TABLE_NAME,
      updateData,
      new FilterBuilder().addCondition('id', userId, FilterType.EQUAL),
    );
        
    return updateData;
  }

  public async delete(userId: number): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const deletionResult = await this.db.delete(
      UserService.TABLE_NAME,
      new FilterBuilder().addCondition('id', userId, FilterType.EQUAL),
    );
        
    console.log(`[USER SERVICE] Deletion result: ${JSON.stringify(deletionResult)}`);
        
    return deletionResult.affectedRows;
  }

  public async close(): Promise<void> {
    await this.db?.close();
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPass: string = await bcrypt.hash(password, saltRounds);
    return hashedPass;
  }

  public async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}
