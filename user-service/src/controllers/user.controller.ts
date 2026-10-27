import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const userService = new UserService();

export const registerUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.register(req.body, req.user?.role);
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

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleFilter = req.query.role as string;
    const users = await userService.getAll(roleFilter);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await userService.getDoctors();
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    const updatedUser = await userService.update(userId, req.body);
    res.status(200).json({ message: 'Usuario actualizado', user: updatedUser });
  } catch (error) {
    next(error);
  }
};
