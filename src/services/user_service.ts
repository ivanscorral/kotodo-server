import { SQLiteWrapper } from '../db/sqlite_wrapper';

export interface NewUserPayload {
    name: string;
    email: string;
    passwordHash: string;
}

export class UserService {
    private db?: SQLiteWrapper;
    private static TABLE_NAME: string = 'users';

    constructor(private newUserPayload: NewUserPayload) {}

    public async insert(): Promise<void> {
        if (!this.db) return;
        this.db.insert(UserService.TABLE_NAME, this.newUserPayload);
    }

    public async build(): Promise<void> {
        this.db = await new SQLiteWrapper('db/kotodo.db').create();
    }

    public close(): void {
        if (!this.db) return;
        this.db.close();
    }
}
