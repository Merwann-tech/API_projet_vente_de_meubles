
import type { Request, Response } from 'express';

function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Route introuvable' });
}

module.exports = { notFound };


