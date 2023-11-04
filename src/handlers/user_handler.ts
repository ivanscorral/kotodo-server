import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { UserService } from '../services/user_service';
import { SQLiteWrapper } from '../db/sqlite_wrapper';

export async function createUserHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const { name, email, password } = req.body;
    const passwordHash = await hashPassword(password);
    const user = await createUser(name, email, passwordHash);
    res.status(201).json(user);
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
): Promise<void> {
    // Insert the user into the database, getting the id back from the database
    const userService = new UserService();
    await userService.build();
    await userService.insert( name, email, passwordHash );
    userService.close();
}

export async function updateUserHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const { name, email, password } = req.body;
    const userId = req.params.id;
    const userService = new UserService();
    await userService.build();
    await userService.update(Number(userId), name, email, password);
    userService.close();
    res.status(201).send(`User with id ${userId} updated`);
}

export async function deleteUserHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const userId = Number(req.params.id);
    
    if (!userId || Number.isNaN(userId)) {
        return res.status(400).send({
            error: 'Id is required/invalid',
        });
    }
    
    try {
        let userService = new UserService();
        await userService.build();
        // The delete method now returns an object with information about the deletion
        const affectedRows = await userService.delete(userId);
        
        // Check if any rows were affected
        if (affectedRows === 0) {
            return res.status(404).send({
                error: `User with id ${userId} not found`,
            });
        }
        
        res.status(204).send(); // 204 status code for successful deletion
        
        await userService.close();  
        
    } catch (error) {
        // Handle any errors during the deletion process
        console.error(error);
        res.status(500).send({
            error: 'Internal Server Error',
        })
    }
    

}
