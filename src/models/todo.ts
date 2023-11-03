export interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    user_id: number;
}

export default Todo;
