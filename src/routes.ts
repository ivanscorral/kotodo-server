
import express, { Request, Response } from 'express';
import { insertTodoHandler, listTodosHandler, completeTodoHandler} from './handlers/todo_handler';
import { createUserHandler } from './handlers/user_handler';
const router = express.Router();


router.get('/todos', listTodosHandler);
router.post('/todos', insertTodoHandler);
router.put('/todos/:id/complete', completeTodoHandler);


router.post('/users/new', createUserHandler);


export default router;
