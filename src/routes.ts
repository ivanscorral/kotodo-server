import express, { Request, Response } from 'express';
import {
    insertTodoHandler,
    listTodosHandler,
    completeTodoHandler,
    getTodoHandler,
    revertTodoHandler,
    updateTodoHandler,
    deleteTodoHandler
} from './handlers/todo_handler';
import { 
    createUserHandler,
    updateUserHandler,
    deleteUserHandler } from './handlers/user_handler';
const router = express.Router();

    router.get('/todos', listTodosHandler);
    router.get('/todos/:id', getTodoHandler);
    router.put('/todos/:id', updateTodoHandler);
    router.post('/todos', insertTodoHandler);
    router.post('/todos/complete', completeTodoHandler);    
    router.post('/todos/revert', revertTodoHandler);
    router.delete('/todos/:id', deleteTodoHandler);
    
router.put('/users/:id', updateUserHandler);
router.post('/users/new', createUserHandler);
router.delete('/users/:id', deleteUserHandler);
export default router;
    