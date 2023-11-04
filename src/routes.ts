import express, { Request, Response } from 'express';
import {
    insertTodoHandler,
    listTodosHandler,
    completeTodoHandler,
    getTodoHandler,
    revertTodoHandler,
    updateTodoHandler,
} from './handlers/todo_handler';
import { 
    createUserHandler,
    updateUserHandler } from './handlers/user_handler';
const router = express.Router();

    router.get('/todos', listTodosHandler);
    router.get('/todos/:id', getTodoHandler);
    router.put('/todos/:id', updateTodoHandler);
    router.post('/todos', insertTodoHandler);
    router.post('/todos/complete', completeTodoHandler);    
    router.post('/todos/revert', revertTodoHandler);
    
router.post('/users/new', createUserHandler);
router.put('/users/:id', updateUserHandler);

export default router;
    