import { NextFunction, Request, Response } from "express";

export function isAuthentified(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.user) {
    return res.status(403).json({ message: "Not Logged." });
  }
  next();
}
