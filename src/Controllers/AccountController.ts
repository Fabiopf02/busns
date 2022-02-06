import { Request, Response } from 'express';
import { db } from '../database/db';
import generateUniqueId from '../utils/generateUniqueId';
import Hash from '../utils/hash';
import { ParamsDictionary } from 'express-serve-static-core';
import { getGeocoding } from '../utils/getGeocoding';
import generateToken from '../utils/generateToken';

interface ICompany {
  id: string;
  account_id: string;
  segment: string;
}
export interface IAddress {
  street: string;
  state: string;
  number: number;
  neighborhood: string;
  city: string;
  zip_code: string;
  account_id: string;
  coords: number[];
}

interface IAccount {
  id: string;
  type: string;
  name: string;
  phone: string;
  password: string;
  firebase_token: string;
}

interface IBody extends IAccount, ICompany, IAddress {};

type TRequest = Request<ParamsDictionary, any, IBody>;

interface IToken {
  firebase_token: string;
}

export default {
  async index(req: Request, res: Response) {
    try {
      const users = await db('accounts')
        .join('companies', 'companies.account_id', '=', 'accounts.id')
        .select([
          'accounts.type',
          'accounts.name',
          'accounts.phone',
          'accounts.created_at',
          'accounts.updated_at',
          'companies.id as company_id',
          'companies.*',
        ]);

      return res.json(users);
    } catch (err) {
      return res.status(500).send({ error: 'An internal error has occurred' });
    }
  },

  async create(req: TRequest, res: Response) {
    try {
      const data = req.body;

      if (!data || !data.password || !data.name || !data.phone || !data.firebase_token) {
        return res.status(400).send();
      }
      if (data.type && data.type !== 'company' && data.type !== 'consumer') {
        return res.status(400).send();
      }
      if (data.type && data.type === 'company' &&
        (!data.segment || !data.state || !data.street ||
          !data.zip_code || !data.number || !data.city || !data.neighborhood)) {
        return res.status(400).send();
      }

      const exists = await db('accounts')
        .select('id')
        .where({ phone: data.phone })
        .first();

      if (exists) {
        return res.status(406).json({ message: 'User already exists' });
      }

      const id = generateUniqueId();

      const passwordHash = Hash.encrypt(data.password);

      await db<IAccount>('accounts').insert({
        id,
        type: data.type,
        phone: data.phone,
        name: data.name,
        password: passwordHash,
        firebase_token: data.firebase_token,
      });

      if (data.type === 'consumer') {
        return res.status(201).json({ id });
      }

      const company_id = generateUniqueId();

      await db<ICompany>('companies').insert({
        id: company_id,
        account_id: id,
        segment: data.segment,
      });

      const address = data.street + ' ' + data.number + ', ' + data.neighborhood
        + ', ' + data.city + ', ' + data.state;

      const coords = await getGeocoding(address);

      await db<IAddress>('address').insert({
        city: data.city,
        number: data.number,
        state: data.state,
        street: data.street,
        zip_code: data.zip_code,
        neighborhood: data.neighborhood,
        account_id: id,
        coords,
      });

      return res.status(201).json({ id, coords, company_id, token: generateToken({ id }) });

    } catch (err) {
      return res.status(500).json({ erro: 'An internal error has occurred'+err });
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const companyId = req.headers.companyid;
      const userId = req.headers.userid;

      await db('companies')
        .where({id: companyId, account_id: userId})
        .update(req.body);

      await db('accounts')
        .where('id', userId)
        .update({
          updated_at: new Date(),
        });

      return res.json({ status: 'success' });

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred'+ err });
    }
  },
  async updateToken(req: Request<ParamsDictionary, any, IToken>, res: Response) {
    try {
      const { firebase_token } = req.body;
      if (!firebase_token) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const userId = req.headers.userid;

      await db('accounts')
        .where('id', userId)
        .update({
          updated_at: new Date(),
        });

      return res.json({ status: 'success' });

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred'+ err });
    }
  },
};
