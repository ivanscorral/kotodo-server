export const tableName: string = 'todos';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
}

export default Todo;
