import bcrypt from 'crypto';

export default function generateUniqueId() {
  return bcrypt.randomBytes(12).toString('hex');
}
