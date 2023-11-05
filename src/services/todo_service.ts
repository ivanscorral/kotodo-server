/* eslint-disable @typescript-eslint/no-explicit-any */
import { SQLiteWrapper } from "../db/sqlite_wrapper";
import { FilterBuilder, FilterType } from "../db/sqlite_wrapper";
import Todo from "../models/todo";

export interface NewTodoPayload {
    title: string;
    description: string;
    user_id: number;
}

export class TodoModel implements Todo {
  public id: number;
  public title: string;
  public description: string | null;
  public completed: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public user_id: number;
    
  constructor(todo: Todo) {
    this.id = todo.id;
    this.title = todo.title;
    this.description = todo.description;
    this.completed = todo.completed;
    this.createdAt = todo.createdAt;
    this.updatedAt = todo.updatedAt;
    this.user_id = todo.user_id;
  }
}

export class TodoService {
  public static TABLE_NAME = "todos";
  private db?: SQLiteWrapper;
    
  public async build(): Promise<void> {
    this.db = new SQLiteWrapper("db/kotodo.db");
    await this.db.create();
  }
    
  public async retrieveByStatus(status: boolean, userId: number): Promise<TodoModel[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db.selectAll(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition("user_id", userId, FilterType.EQUAL).addCondition("completed", status, FilterType.EQUAL),
    );
        
  }

  public async insert(newTodoPayload: NewTodoPayload): Promise<number> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db?.insert(TodoService.TABLE_NAME, newTodoPayload);
  }
    
  public async getCompletionStatus(todoId: number): Promise<boolean> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const isCompleted = await this.db.selectAll(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition("id", todoId, FilterType.EQUAL),
    )
    if (isCompleted.length === 0) return false;
    return isCompleted[0].completed === 1;
  }
    
  public async get(todoId: number): Promise<TodoModel> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const todo = await this.db.selectAll(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition("id", todoId, FilterType.EQUAL),
    );
    return todo[0];
  }
    
  public async update(
    todoId: number,
    title?: string,
    description?: string,
  ): Promise<any> {
    if (!this.db) 
    {
      throw new Error("Database not initialized");
    }
        
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description; 
        
    if (Object.keys(updateData).length) {
      updateData.updatedAt = new Date().toISOString();
    }
        
    await this.db.update(
      TodoService.TABLE_NAME,
      updateData,
      new FilterBuilder().addCondition("id", todoId, FilterType.EQUAL),
    );
        
    return updateData;
  }
    
  public async getAll(userId: number): Promise<TodoModel[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db.selectAll(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition("user_id", userId, FilterType.EQUAL),
    );
  }
    
  public async toggleCompletion(todoId: number): Promise<void> {
    if (!this.db) return;
    const todo = await this.db.selectAll(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition("id", todoId, FilterType.EQUAL),
    );
    if (todo.length === 0) return;
    await this.db.update(
      TodoService.TABLE_NAME,
      { completed: todo[0].completed === 0 ? 1 : 0, updatedAt: new Date().toISOString() },
      new FilterBuilder().addCondition("id", todoId, FilterType.EQUAL),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getFromUserId(userId: number): Promise<any> {
    console.log("Get todos for user: " + userId);
    console.log(this.db);
    return await this.db?.selectAll(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition(
        "user_id",
        userId,
        FilterType.EQUAL,
      ),
    );
  }

  public async close(): Promise<void> {
    await this.db?.close();
  }
    
  public createTodo(row: any): TodoModel {
    const todo = {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      user_id: row.user_id,
    };
    return todo;
  }
    
  public async delete(todoId: number): Promise<number> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    
    const deletionResult = await this.db.delete(
      TodoService.TABLE_NAME,
      new FilterBuilder().addCondition("id", todoId, FilterType.EQUAL),
    );
    console.log(`[TODO SERVICE] Deletion result: ${JSON.stringify(deletionResult)}`);
    
    return deletionResult.affectedRows;
  }
    
    
    
}
