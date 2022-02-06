import { Request, Response, NextFunction } from 'express';

import * as jwt from 'jsonwebtoken';

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).send({ error: 'No token provided!' });

  const parts = authHeader.split(' ');

  if (parts.length !== 2)
    return res.status(401).send({ error: 'Token error!' });

  const [schema, token] = parts;

  if (!/^Bearer$/i.test(schema))
    return res.status(401).send({ error: 'Token malformatted!' });

  jwt.verify(token, process.env.SECRET, (err, decoded: { id: string }) => {
    if (err) return res.status(401).send({ error: 'Invalid Token' });

    req.userId = decoded.id;

    const userId = req.headers.userid;

    if (userId !== decoded.id) {
      return res.status(403).json({ error: 'Operation not permited' });
    }

    return next();
  });
}

export default authMiddleware;
