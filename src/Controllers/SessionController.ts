import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { db } from '../database/db';
import generateToken from '../utils/generateToken';
import Hash from '../utils/hash';

interface ISession {
  phone: string;
  password: string;
}

type TRequestSession = Request<ParamsDictionary, any, ISession>;

export default {
  async create(req: TRequestSession, res: Response) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const part = await db('accounts')
        .select('password', 'type')
        .where('phone', phone)
        .first();

      if (!part) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const equal = Hash.compare(password, part.password);

      if (!equal) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const account = await db('accounts')
      .select([
        'id',
        'type',
        'name',
        'phone',
        'created_at',
        'updated_at'
      ])
      .where({
        phone,
      })
      .first();

      const token = generateToken({ id: account.id });
      
      if (part.type === 'consumer') {
        return res.json({ account, token });
      }

      const company = await db('companies')
        .where('account_id', account.id)
        .select('companies.*')
        .first();

      const address = await db('address')
        .where('account_id', account.id)
        .select('*')
        .first();

      account.company = company;
      account.address = address;

      return res.json({ account, token });

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred'+err });
    }
  }
}