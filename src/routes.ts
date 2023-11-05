import {
  insertTodoHandler,
  listTodosHandler,
  completeTodoHandler,
  getTodoHandler,
  revertTodoHandler,
  updateTodoHandler,
  deleteTodoHandler,
  retrieveTodosByStatusHandler
} from "./handlers/todo_handler";
import { 
  createUserHandler,
  updateUserHandler,
  deleteUserHandler } from "./handlers/user_handler";
    
import { createUserValidation, updateUserValidation, deleteUserValidation } from "./validations/user_validations";
import { idTodoValidation, updateTodoValidations, insertTodoValidations, bodyIdValidation, retrieveTodosByStatusValidations } from "./validations/todo_validations";
const router = express.Router();

router.get("/todos/all/:id", idTodoValidation, listTodosHandler);
router.get("/todos/:id", idTodoValidation, getTodoHandler);
router.get("/todos/status/:status", retrieveTodosByStatusValidations, retrieveTodosByStatusHandler);

router.put("/todos/:id", updateTodoValidations, updateTodoHandler);
router.post("/todos", insertTodoValidations, insertTodoHandler);
router.post("/todos/complete", bodyIdValidation, completeTodoHandler);    
router.post("/todos/revert", bodyIdValidation, revertTodoHandler);
router.delete("/todos/:id", bodyIdValidation, deleteTodoHandler);

router.put("/users/:id", updateUserValidation, updateUserHandler);
router.post("/users/new", createUserValidation, createUserHandler);
router.delete("/users/:id", deleteUserValidation, deleteUserHandler);
export default router;
    
