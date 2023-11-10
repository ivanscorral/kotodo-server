import { check, param, oneOf, body } from 'express-validator';

export const createUserValidation = [
  check('name', 'Name is required').isString(),
  check('email', 'Email is required').isEmail(),
  check('password', 'Password is required').isString().trim()
];

export const loginValidation = [
  oneOf([
    body('email', 'Email must be a valid email').isEmail().normalizeEmail(),
    body('name', 'Name must be a string').isString()
  ], { message: 'At least one of [email, password] must be provided and valid' }),
  body('password', 'Password is required').isString().trim()
]

export const updateUserValidation = [
  oneOf([
    check('name', 'The name must be a string').isString(),
    check('email', 'The email must be a valid email').isEmail(),
    check('password', 'The password must be a string').isString(),
  ], { message: 'At least one of [name, email, password] must be provided and valid' }),
];

export const deleteUserValidation = [
  param('id', 'The id must be a positive integer').isInt( { gt: 0 })
];
