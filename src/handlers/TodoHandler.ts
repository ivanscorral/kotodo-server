import { Request, Response } from 'express';
import { NewTodoPayload, TodoModel, TodoService } from '../services/TodoService';
import { matchedData, validationResult } from 'express-validator';
import { RequestWithUserId } from '../middleware/AuthenticationMiddleware';

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
    res.status(200).json({ message: 'Todo retrieved successfully', data: todo });
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

    res.status(200).json({ message: 'Todos retrieved successfully', data: todos });
  } catch (error) {
    console.error(error);
    // 500 Internal Server Error
    return res.status(500).json({ error: 'Internal Server Error', code: 500 });
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
    res.status(500).json({ error: 'Internal Server Error', code: 500 });
  }
}

// POST /todos/revert
export async function revertTodoHandler(req: RequestWithUserId, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
  const id = req.body.id;
  const userId = Number(req.userId);
  const todo_service = new TodoService();
  await todo_service.build();
  console.log(`[POST] /todos/revert id: ${id}`);
  const isCompleted = await todo_service.getCompletionStatus(id, userId);
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
export async function insertTodoHandler(req: RequestWithUserId, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
    
  const userId = Number(req.userId);
  const { title, description } = matchedData(req);

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
    res.status(201).json({ message: 'Todo item created', data: todo });
  } catch (error) {
    await todo_service.close();
        
    // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.
    res.status(500).json({error: 'Internal Server Error', code: 500});
  }
}

// Handler for listing all todo items
export async function listTodosHandler(req: RequestWithUserId, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    return res.status(400).json({ error: errors.array(), code: 400 });
  }

  const userId = Number(req.userId);
  

  const todo_service = new TodoService();
  await todo_service.build();

  try {
    const results = await todo_service.getAll(userId);
    await todo_service.close();
        
    // 200 OK: The request has succeeded.
    return res.status(200).json({message: 'Todo items retrieved successfully', data: results});
  } catch (error) {
    await todo_service.close();
        
    // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.
    return res.status(500).send('An error occurred while fetching the Todo items');
  }
}



export async function completeTodoHandler(req: RequestWithUserId, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    return res.status(400).json({ error: errors.array(), code: 400 });
  }

  const id = req.body.id;
  const userId = Number(req.userId);
  const todo_service = new TodoService();
  await todo_service.build();
    
  console.log(`[POST] /todos/complete id: ${id}`);
    
  const isCompleted = await todo_service.getCompletionStatus(id, userId);
  if (isCompleted === null) {
    // 404 Not Found: The server can not find the requested resource.
    return res.status(404).json({ error: `Task with id ${id} not found`, code: 404 } );
  }
  if (isCompleted) {
    // 409 Conflict: The request could not be completed due to a conflict with the current state of the target resource.
    return res.status(409).json({ error: `Conflict: Task with id ${id} is already completed`, code: 409 } );
  }
  await todo_service.toggleCompletion(id);
  const completedTodo = await todo_service.get(id);
  await todo_service.close();
  
  return res.status(200).json({ message: `Task with id ${id} completed`, data: completedTodo });
}

export async function deleteTodoHandler(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array(), code: 400 });
  }
  const { id } = matchedData(req);
    
  try {
    const todo_service = new TodoService();
    await todo_service.build();
    const affectedRows = await todo_service.delete(id);

    if (affectedRows === 0) {
      return res.status(404).send({
        error: 'Nothing to delete.',
      });
    }

    res.status(200).json({message: `Task with id ${id} deleted`});

    await todo_service.close();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: 'An error occurred while deleting the Todo',
      code: 500
    });
  }
}
