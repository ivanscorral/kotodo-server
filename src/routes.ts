import express, { Request, Response } from 'express';
import {
    insertTodoHandler,
    listTodosHandler,
    completeTodoHandler,
    getTodoHandler,
    revertTodoHandler,
} from './handlers/todo_handler';
import { createUserHandler } from './handlers/user_handler';
const router = express.Router();

    router.get('/todos', listTodosHandler);
    router.get('/todos/:id', getTodoHandler);
    router.post('/todos', insertTodoHandler);
    router.post('/todos/complete', completeTodoHandler);
    router.post('/todos/revert', revertTodoHandler);
    
router.post('/users/new', createUserHandler);

export default router;
