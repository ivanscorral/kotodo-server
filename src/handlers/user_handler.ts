import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

import { UserService } from "../services/user_service";
import { SQLiteWrapper } from "../db/sqlite_wrapper";
import { User } from "../models/user";

export async function createUserHandler(
  req: Request,
  res: Response,
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  const passwordHash = await hashPassword(password);
  try {
    const user = await createUser(name, email, passwordHash);
    return res.status(201).json({ message: "User created", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPass: string = await bcrypt.hash(password, saltRounds);
  return hashedPass;
}

async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const isMatch = bcrypt.compare(password, hashedPassword);
  return isMatch;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<User> {
  // Insert the user into the database, getting the id back from the database

  const userService = new UserService();
  await userService.build();
  const insertedId = await userService.insert( name, email, passwordHash );
  let user: User;
  if (insertedId === null) {
    throw new Error("Failed to insert user");
  } else {
    user = await userService.get(insertedId);
  } 
  userService.close();
  return user;
}

export async function updateUserHandler(
  req: Request,
  res: Response,
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id, name, email, password } = matchedData(req);
    const userService = new UserService();
    await userService.build();
    const updatedUser = await userService.update(id, name, email, password);
    userService.close();
    return res.status(200).json({ message: "User updated", data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", code: 500 });
  }
}

export async function deleteUserHandler(
  req: Request,
  res: Response,
){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = Number(req.params.id);

    
  try {
    const userService = new UserService();
    await userService.build();
        
    const affectedRows = await userService.delete(userId);
        
    if (affectedRows === 0) {
      return res.status(404).send({
        error: `User with id ${userId} not found`,
      });
    }
        
    return res.status(204).send(); // 204 status code for successful deletion
        
    await userService.close();  
        
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: "Internal Server Error",
    })
  }
    

}
