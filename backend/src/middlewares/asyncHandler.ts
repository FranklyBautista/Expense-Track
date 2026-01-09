import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * asyncHandler envuelve una ruta async para que cualquier error
 * vaya automáticamente a next(err) y lo maneje tu errorHandler global.
 */
//fn =  funcion, las funciones se pueden pasar como parametros
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
