import bcrypt from 'bcrypt';

const salt = bcrypt.genSaltSync(10);
export default {
  encrypt(value: string) {
    const encrypted = bcrypt.hashSync(value, salt);
    return encrypted;
  },

  compare(value: string, enc: string) {
    const desc = bcrypt.compareSync(value, enc);
    return desc;
  },
};
