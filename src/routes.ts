import {
  completeTodoHandler,
  deleteTodoHandler,
  getTodoHandler,
  insertTodoHandler,
  listTodosHandler,
  retrieveTodosByStatusHandler,
  revertTodoHandler,
  updateTodoHandler,
} from './handlers/todo_handler';
import {
  createUserHandler,
  deleteUserHandler,
  loginHandler,
  updateUserHandler,
} from './handlers/user_handler';

import {
  createUserValidation,
  deleteUserValidation,
  loginValidation,
  updateUserValidation,
} from './validations/user_validations';
import {
  bodyIdValidation,
  idTodoValidation,
  insertTodoValidations,
  retrieveTodosByStatusValidations,
  updateTodoValidations,
} from './validations/todo_validations';
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
