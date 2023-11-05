import { check, param, oneOf } from "express-validator";

export const createUserValidation = [
  check("name", "Name is required").isString(),
  check("email", "Email is required").isEmail(),
  check("password", "Password is required").isString()
];

export const updateUserValidation = [
  param("id", "The id must be a positive integer").isInt( { gt: 0 }), 
  oneOf([
    check("name", "The name must be a string").isString(),
    check("email", "The email must be a valid email").isEmail(),
    check("password", "The password must be a string").isString(),
  ], { message: "At least one of [name, email, password] must be provided and valid" }),
];

export const deleteUserValidation = [
  param("id", "The id must be a positive integer").isInt( { gt: 0 })
];
