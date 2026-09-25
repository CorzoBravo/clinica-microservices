import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ message: 'Usuario creado exitosamente', user });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.login(req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
