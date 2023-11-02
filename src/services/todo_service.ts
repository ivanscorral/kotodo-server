import { SQLiteWrapper } from "../db/sqlite_wrapper";

export interface NewTodoPayload {
    title: string;
    description: string;
    user_id: number;
}

export class TodoService {
    public static TABLE_NAME = 'todos';
    private db?: SQLiteWrapper;
    
    constructor(private newTodoPayload: NewTodoPayload) {}
    
    public async build(): Promise<void> {
        this.db = new SQLiteWrapper('db/kotodo.db');
        await this.db.create();
    }
    
    public async insert(): Promise<void> {
        await this.db?.insert(TodoService.TABLE_NAME, this.newTodoPayload);
    }
}

