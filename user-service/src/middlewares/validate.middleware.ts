import { Request, Response, NextFunction } from 'express';

interface AnyZodObject {
  parseAsync(data: unknown): Promise<unknown>;
}

interface ZodValidationError extends Error {
  errors: unknown[];
}

const isZodError = (error: unknown): error is ZodValidationError =>
  error instanceof Error && error.name === 'ZodError' && 'errors' in error;

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (isZodError(error)) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: error.errors,
        });
      }
      return next(error);
    }
  };
};
