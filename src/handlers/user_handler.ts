import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { UserService } from '../services/user_service';
import { SQLiteWrapper } from '../db/sqlite_wrapper';

export async function createUserHandler(req: Request, res: Response): Promise<void> {
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

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const isMatch = bcrypt.compare(password, hashedPassword);
    return isMatch;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<void> {
    // Insert the user into the database, getting the id back from the database
    let userService = new UserService({ name, email, passwordHash })
    await userService.build();
    await userService.insert();
    userService.close();

}
