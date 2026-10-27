import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Propagar datos parseados, desinfectados y validados por Zod
      if ((parsed as any).body !== undefined) req.body = (parsed as any).body;
      if ((parsed as any).query !== undefined) req.query = (parsed as any).query;
      if ((parsed as any).params !== undefined) req.params = (parsed as any).params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: error.errors,
        });
      }
      return next(error);
    }
  };
};
