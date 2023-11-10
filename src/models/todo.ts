export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    user_id: number;
}

export default Todo;
