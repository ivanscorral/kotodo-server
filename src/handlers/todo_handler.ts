import { Request, Response } from 'express';
import { NewTodoPayload, TodoModel, TodoService } from '../services/todo_service';
import { matchedData, validationResult } from 'express-validator';


// GET /todos/:id
export async function getTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    let todo_service = new TodoService();
    await todo_service.build();
    let todo = await todo_service.get(Number(id));
    await todo_service.close();
    if (todo) {
        // 200 OK
        res.status(200).send(todo);
    } else {
        // 404 Not Found
        res.status(404).send({ error: `Todo with id ${id} not found` });
    }
}

export async function retrieveTodosByStatusHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { status, userId } = matchedData(req);
        const intStatus = parseInt(status);
        let todoService = new TodoService();
        await todoService.build();

        const todos = await todoService.retrieveByStatus(status, userId);
        await todoService.close();

        res.status(200).json({ todos });
    } catch (error) {
        console.error(error);
        // 500 Internal Server Error
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
// PUT /todos/:id
export async function updateTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id, title, description } = matchedData(req);
        let todo_service = new TodoService();
        await todo_service.build();

        await todo_service.update(Number(id), title, description);
        await todo_service.close();

            res.status(200).json({ message: `Todo with id ${id} updated` });
       
    } catch (error) {
        console.error(error);
        // 500 Internal Server Error
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// POST /todos/revert
export async function revertTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.body.id;
    let todo_service = new TodoService();
    await todo_service.build();
    console.log(`[POST] /todos/revert id: ${id}`);
    let isCompleted = await todo_service.getCompletionStatus(id);
    if (isCompleted === null) {
        // 404 Not Found
        await todo_service.close();
        return res.status(404).send({ error: `Task with id ${id} not found` });
    }
    if (!isCompleted) {
        // 409 Conflict
        await todo_service.close();
        return res.status(409).send( { error: `Conflict: Task with id ${id} is not completed` } );
    }
    await todo_service.toggleCompletion(id);
    await todo_service.close();
    // 204 No Content
    res.status(204).send();
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

    let todo_service = new TodoService();
    await todo_service.build();

    try {
        let insertedId = await todo_service.insert(newTodoPayload);
        console.log(insertedId);
        await todo_service.close();
        
        // 201 Created: The request has succeeded and a new resource has been created as a result.
        res.status(201).json({ id: insertedId, title, description });
    } catch (error) {
        await todo_service.close();
        
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.
        res.status(500).send("An error occurred while inserting the Todo item");
    }
}

// Handler for listing all todo items
export async function listTodosHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request: The server could not understand the request due to invalid syntax.
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    let todo_service = new TodoService();
    await todo_service.build();

    try {
        let results = await todo_service.getAll(Number(userId));
        await todo_service.close();
        
        // 200 OK: The request has succeeded.
        return res.status(200).send(results);
    } catch (error) {
        await todo_service.close();
        
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.
        return res.status(500).send("An error occurred while fetching the Todo items");
    }
}



export async function completeTodoHandler(req: Request, res: Response) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request: The server could not understand the request due to invalid syntax.
        return res.status(400).json({ errors: errors.array() });
    }

    const id = req.body.id;
    let todo_service = new TodoService();
    await todo_service.build();
    
    console.log(`[POST] /todos/complete id: ${id}`);
    
    let isCompleted = await todo_service.getCompletionStatus(id);
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
        let todo_service = new TodoService();
        await todo_service.build();
        const affectedRows = await todo_service.delete(id);

        if (affectedRows === 0) {
            return res.status(404).send({
                error: 'Nothing to delete.',
            });
        }

        res.status(204).send(); // 204 status code for successful deletion

        await todo_service.close();
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'An error occurred while deleting the Todo',
        });
    }
}

