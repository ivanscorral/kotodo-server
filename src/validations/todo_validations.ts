import { oneOf, param, check } from "express-validator";

export const idTodoValidation = [
    param('id', 'The id must be a positive integer').isInt( { gt: 0 })
];

export const updateTodoValidations = [
    param('id', 'The id must be a positive integer').isInt( { gt: 0 }),
    oneOf([
        check('title', 'The title must be a string').isString(),
        check('description', 'The description must be a string').isString()
    ])
];

export const bodyIdValidation = [
    check('id', 'The id must be a positive integer').isInt( { gt: 0 })
];

export const insertTodoValidations = [
    check('title', 'The title must be a string').isString(),
    check('description', 'The description must be a string').isString(),
    check('userId', 'The userId must be a positive integer').isInt( { gt: 0 })
];


