import { oneOf, param, body } from "express-validator";

export const idTodoValidation = [
    param('id', 'The id must be a positive integer').isInt( { gt: 0 })
];

export const updateTodoValidations = [
    param('id', 'The id must be a positive integer').isInt( { gt: 0 }),
    oneOf([
        body('title', 'The title must be a string').isString(),
        body('description', 'The description must be a string').isString()
    ])
];

export const bodyIdValidation = [
    body('id', 'The id must be a positive integer').isInt( { gt: 0 })
];

export const insertTodoValidations = [
    body('title', 'The title must be a string').isString(),
    body('description', 'The description must be a string').isString(),
    body('userId', 'The userId must be a positive integer').isInt( { gt: 0 })
];

export const retrieveTodosByStatusValidations = [
    param('status').toBoolean(),
    body('userId', 'The userId must be a string').exists().isString()
];
