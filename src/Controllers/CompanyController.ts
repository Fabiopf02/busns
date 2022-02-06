import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { db } from '../database/db';

interface ReqQuery {
  neighborhood: string;
}
interface Params {
  id: string;
}

type TRequest = Request<ParamsDictionary, any, any, ReqQuery>;

export default {
  async index(req: TRequest, res: Response) {
    try {

      const { neighborhood } = req.query;

      const companies = await db('companies')
        .join('accounts', 'accounts.id' , '=', 'companies.account_id')
        .join('address', 'address.account_id', '=', 'accounts.id')
        .andWhere({
          'address.neighborhood': neighborhood,
          'companies.activated': true,
        })
        .select([
          'companies.id',
          'companies.segment',
          'companies.opening',
          'companies.closing',
          'accounts.name',
          'accounts.type',
          'address.coords',
        ]);

      return res.json(companies);

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async find(req: Request<Params>, res: Response) {
    try {
      const { id } = req.params;

      const company = await db('companies')
        .where('id', id)
        .select([
          '*',
        ]).first();

      if (!company) {
        return res.json(company);
      }

      const account = await db('accounts')
        .where('id', company.account_id)
        .select([
          'id',
          'name',
          'phone',
          'type',
          'created_at',
          'updated_at',
        ]).first();
      const address = await db('address')
        .where('account_id', account.id)
        .select('*').first();
      
      company.account = account;
      company.address = address;

      return res.json(company);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const companyId = req.headers.companyid;
      const userId = req.headers.userid;

      const exists = await db('companies')
        .join('accounts', 'accounts.id', '=', 'companies.account_id')
        .andWhere({
          'companies.account_id': userId,
          'companies.id': companyId,
        })
        .select('accounts.name');

      if (!exists) {
        return res.status(401).send();
      }

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
}
