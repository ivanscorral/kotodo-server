import {
  completeTodoHandler, deleteTodoHandler, getTodoHandler, insertTodoHandler, listTodosHandler, retrieveTodosByStatusHandler, revertTodoHandler, updateTodoHandler
} from './handlers/TodoHandler';
import {
  createUserHandler, deleteUserHandler, loginHandler, updateUserHandler
} from './handlers/UserHandler';

import {
  createUserValidation, loginValidation, updateUserValidation
} from './validations/UserValidations';
import {
  bodyIdValidation, idTodoValidation, insertTodoValidations, retrieveTodosByStatusValidations, updateTodoValidations
} from './validations/TodoValidations';
import { authenticationMiddleware } from './middleware/AuthenticationMiddleware';

import express from 'express';

const router = express.Router();

router.get('/todos/', authenticationMiddleware, listTodosHandler);
router.get('/todos/:id', authenticationMiddleware, idTodoValidation, getTodoHandler);
router.get(  '/todos/status/:status',
  retrieveTodosByStatusValidations,
  retrieveTodosByStatusHandler,);

router.put('/todos/:id', authenticationMiddleware ,updateTodoValidations, updateTodoHandler);
router.post('/todos',authenticationMiddleware,insertTodoValidations, insertTodoHandler);
router.post('/todos/:id/complete',authenticationMiddleware, idTodoValidation, completeTodoHandler);
router.post('/todos/:id/revert',authenticationMiddleware, idTodoValidation, revertTodoHandler);
router.delete('/todos/:id',authenticationMiddleware, bodyIdValidation, deleteTodoHandler);

router.put('/users/me', authenticationMiddleware, updateUserValidation, updateUserHandler);
router.post('/users/new', createUserValidation, createUserHandler);
router.post('/users/login', loginValidation, loginHandler);
router.delete('/users/:id', authenticationMiddleware, deleteUserHandler);
export default router;
