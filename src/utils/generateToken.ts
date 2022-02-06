import * as jwt from 'jsonwebtoken';

export default function generateToken(params = {}) {
  const token = jwt.sign(params, process.env.SECRET, {
    expiresIn: 604800,
  });
  return token;
}
