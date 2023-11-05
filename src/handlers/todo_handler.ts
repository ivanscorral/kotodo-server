import { Request, Response } from "express";
import { NewTodoPayload, TodoModel, TodoService } from "../services/todo_service";
import { matchedData, validationResult } from "express-validator";


// GET /todos/:id
export async function getTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
  const id = req.params.id;
  const todo_service = new TodoService();
  await todo_service.build();
  const todo = await todo_service.get(Number(id));
  await todo_service.close();
  if (todo) {
    // 200 OK
    res.status(200).json({ todo });
  } else {
    // 404 Not Found
    res.status(404).send({ error: `Todo with id ${id} not found`, code: 404 });
  }
}

export async function retrieveTodosByStatusHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
  try {
    const { status, userId } = matchedData(req);
    const intStatus = parseInt(status);
    const todoService = new TodoService();
    await todoService.build();

    const todos = await todoService.retrieveByStatus(status, userId);
    await todoService.close();

    res.status(200).json({ todos });
  } catch (error) {
    console.error(error);
    // 500 Internal Server Error
    return res.status(500).json({ error: "Internal Server Error", code: 500 });
  }
}
// PUT /todos/:id
export async function updateTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
  try {
    const { id, title, description } = matchedData(req);
    const todo_service = new TodoService();
    await todo_service.build();
        
    const updatedTodo = await todo_service.update(Number(id), title, description);
        
        
        
    await todo_service.close();

    res.status(200).json({ message: `Todo with id ${id} updated`, data: updatedTodo });
       
  } catch (error) {
    console.error(error);
    // 500 Internal Server Error
    res.status(500).json({ error: "Internal Server Error", code: 500 });
  }
}

// POST /todos/revert
export async function revertTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
  const id = req.body.id;
  const todo_service = new TodoService();
  await todo_service.build();
  console.log(`[POST] /todos/revert id: ${id}`);
  const isCompleted = await todo_service.getCompletionStatus(id);
  if (isCompleted === null) {
    // 404 Not Found
    await todo_service.close();
    return res.status(404).send({ error: `Task with id ${id} not found`, code: 404 } );
  }
  if (!isCompleted) {
    // 409 Conflict
    await todo_service.close();
    return res.status(409).send( { error: `Conflict: Task with id ${id} is not completed`, code: 409 } );
  }
  await todo_service.toggleCompletion(id);
  const revertedTodo = await todo_service.get(id);
  await todo_service.close();
  res.status(200).json({ message: `Task with id ${id} reverted`, data: revertedTodo });
}


// Handler for inserting a new todo item// Handler for inserting a new todo item
export async function insertTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    return res.status(400).json({ errors: errors.array() });
  }
    
  const { title, description, userId } = matchedData(req);

  const newTodoPayload: NewTodoPayload = {
    title,
    description,
    user_id: userId,
  };

  const todo_service = new TodoService();
  await todo_service.build();

  try {
    const insertedId = await todo_service.insert(newTodoPayload);
    const todo = await todo_service.get(insertedId);
    await todo_service.close();
        
    // 201 Created: The request has succeeded and a new resource has been created as a result.
    res.status(201).json({ message: "Todo item created", data: todo });
  } catch (error) {
    await todo_service.close();
        
    // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.
    res.status(500).json({error: "Internal Server Error", code: 500});
  }
}

// Handler for listing all todo items
export async function listTodosHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    return res.status(400).json({ error: errors.array(), code: 400 });
  }

  const userId = req.params.id;
  const todo_service = new TodoService();
  await todo_service.build();

  try {
    const results = await todo_service.getAll(Number(userId));
    await todo_service.close();
        
    // 200 OK: The request has succeeded.
    return res.status(200).json({todos: results});
  } catch (error) {
    await todo_service.close();
        
    // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.
    return res.status(500).send("An error occurred while fetching the Todo items");
  }
}



export async function completeTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    return res.status(400).json({ error: errors.array(), code: 400 });
  }

  const id = req.body.id;
  const todo_service = new TodoService();
  await todo_service.build();
    
  console.log(`[POST] /todos/complete id: ${id}`);
    
  const isCompleted = await todo_service.getCompletionStatus(id);
  if (isCompleted === null) {
    // 404 Not Found: The server can not find the requested resource.
    return res.status(404).send("Task not found");
  }
  if (isCompleted) {
    // 409 Conflict: The request could not be completed due to a conflict with the current state of the target resource.
    return res.status(409).send("Task already completed");
  }
  await todo_service.toggleCompletion(id);
  await todo_service.close();

  // 204 No Content: The server has successfully fulfilled the request and there is no additional content to send in the response.
  return res.status(204).send();
}

export async function deleteTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = matchedData(req);
    
  try {
    const todo_service = new TodoService();
    await todo_service.build();
    const affectedRows = await todo_service.delete(id);

    if (affectedRows === 0) {
      return res.status(404).send({
        error: "Nothing to delete.",
      });
    }

    res.status(204).send(); // 204 status code for successful deletion

    await todo_service.close();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "An error occurred while deleting the Todo",
    });
  }
}

