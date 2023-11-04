import { Request, Response } from 'express';
import { NewTodoPayload, TodoModel, TodoService } from '../services/todo_service';
import { matchedData, validationResult } from 'express-validator';


export async function getTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    let todo_service = new TodoService();
    await todo_service.build();
    let todo = await todo_service.get(Number(id));
    await todo_service.close();
    res.status(201).send(todo);
}
// PUT /todos/:id
export async function updateTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function revertTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.body.id;
    let todo_service = new TodoService();
    await todo_service.build();
    console.log(`[POST] /todos/revert id: ${id}`);
    let isCompleted = await todo_service.getCompletionStatus(id);
    if (!isCompleted) {
        return res.status(200).send("Task not completed");
    }
    await todo_service.toggleCompletion(id);
    await todo_service.close();
    res.status(200).send("Task reverted");
}

// Handler for inserting a new todo item
export async function insertTodoHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, userId } = matchedData(req);

    // Create a new todo item
    const newTodoPayload: NewTodoPayload = {
        title,
        description,
        user_id: userId,
    };

    let todo_service = new TodoService();
    await todo_service.build();
    let insertedId = await todo_service.insert(newTodoPayload);
    console.log(insertedId);
    await todo_service.close();
    // Return the newly created todo item
    res.status(201).json({ id: insertedId, title, description });
}

// Handler for listing all todo items
export async function listTodosHandler(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.params.id;
    let todo_service = new TodoService();
    await todo_service.build();
    let results = await todo_service.getAll(Number(userId));
    await todo_service.close();
    return res.status(201).send(results);
}


export async function completeTodoHandler(req: Request, res: Response) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.body.id;
    let todo_service = new TodoService();
    await todo_service.build();
    console.log(`[POST] /todos/complete id: ${id}`);
    let isCompleted = await todo_service.getCompletionStatus(id);
    if (isCompleted) {
        return res.status(200).send("Task already completed");
    }
    await todo_service.toggleCompletion(id);
    await todo_service.close();
    return  res.status(200).send("Task completed");
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
                error: `Todo with id ${id} not found`,
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

