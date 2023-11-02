
import { Request, Response } from 'express';
import Todo from '../models/todo';
import {FilterBuilder, SQLiteWrapper, FilterType, LogicalOperator, FilterCondition}  from '../db/sqlite_wrapper';

// In-memory storage for todo items
const todos: Todo[] = [];

// Handler for inserting a new todo item
export async function insertTodoHandler(req: Request, res: Response) {
  const { title, description } = req.body;

  // Create a new todo item
  const todo: Todo = {
    id: todos.length + 1,
    title,
    description,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
  };

  // Add the new todo item to the in-memory storage
  console.log(todos);
  // Memory storage
  // Filter by user
  

  let dbWrapper = new SQLiteWrapper('db/kotodo.db')
  await dbWrapper.create();
  await dbWrapper.insert('todos', todo);
  
  todos.push(todo); 

  // Return the newly created todo item
  res.status(201).json(todo);
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
