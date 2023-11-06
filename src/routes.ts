import {
  completeTodoHandler,
  deleteTodoHandler,
  getTodoHandler,
  insertTodoHandler,
  listTodosHandler,
  retrieveTodosByStatusHandler,
  revertTodoHandler,
  updateTodoHandler,
} from './handlers/TodoHandler';
import {
  createUserHandler,
  deleteUserHandler,
  loginHandler,
  updateUserHandler,
} from './handlers/UserHandler';

import {
  createUserValidation,
  deleteUserValidation,
  loginValidation,
  updateUserValidation,
} from './validations/UserValidations';
import {
  bodyIdValidation,
  idTodoValidation,
  insertTodoValidations,
  retrieveTodosByStatusValidations,
  updateTodoValidations,
} from './validations/TodoValidations';
import express from 'express';

const router = express.Router();

router.get('/todos/all/:id', idTodoValidation, listTodosHandler);
router.get('/todos/:id', idTodoValidation, getTodoHandler);
router.get(
  '/todos/status/:status',
  retrieveTodosByStatusValidations,
  retrieveTodosByStatusHandler,
);

router.put('/todos/:id', updateTodoValidations, updateTodoHandler);
router.post('/todos', insertTodoValidations, insertTodoHandler);
router.post('/todos/complete', bodyIdValidation, completeTodoHandler);
router.post('/todos/revert', bodyIdValidation, revertTodoHandler);
router.delete('/todos/:id', bodyIdValidation, deleteTodoHandler);

router.put('/users/:id', updateUserValidation, updateUserHandler);
router.post('/users/new', createUserValidation, createUserHandler);
router.post('/users/login', loginValidation, loginHandler);
router.delete('/users/:id', deleteUserValidation, deleteUserHandler);
export default router;
