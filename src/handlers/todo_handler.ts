
import { Request, Response } from 'express';
import Todo from '../models/todo';
import {FilterBuilder, SQLiteWrapper, FilterType, LogicalOperator, FilterCondition}  from '../db/sqlite_wrapper';
import { NewTodoPayload, TodoService } from '../services/todo_service';


// Handler for inserting a new todo item
export async function insertTodoHandler(req: Request, res: Response) {
  const { title, description, userId } = req.body;

    
  // Create a new todo item 
  const newTodoPayload: NewTodoPayload = {
    title,
    description,
    user_id: userId
  };
  
  let todo_service = new TodoService(newTodoPayload);
  await todo_service.build();
  await todo_service.insert();


  // Return the newly created todo item
  res.status(201).json(newTodoPayload);
};

// Handler for listing all todo items
export async function listTodosHandler(req: Request, res: Response) {
  // TODO: Implement listTodosHandler
  
  let filterBuilder = new FilterBuilder()
    .addCondition('userId', 1, FilterType.EQUAL);
    

  let dbWrapper = new SQLiteWrapper('db/kotodo.db')
  await dbWrapper.create();
  await dbWrapper.select('todos', filterBuilder);
  res.status(501).send('Not implemented');
};

export async function completeTodoHandler(req: Request, res: Response) {
    // TODO: Implement completeTodoHandler
    let filterBuilder = new FilterBuilder()
        .addCondition('userId', 1, FilterType.EQUAL);
        
    let dbWrapper = new SQLiteWrapper('db/kotodo.db')
    await dbWrapper.create();    
    res.status(501).send('Not implemented');
}
