import { Request, Response } from 'express';
import { db } from '../database/db';
import { ParamsDictionary } from 'express-serve-static-core';
import generateUniqueId from '../utils/generateUniqueId';

interface IService {
  id?: string; 
  name: string;
  price: number;
  delivery: string;
  schedulable: boolean;
  associated_product?: boolean;
  activated?: boolean;
  company_id?: string | any;
}

type TRequest = Request<ParamsDictionary, any, IService>;

export default {
  async index(req: Request, res: Response) {
    try {
      const companyId = req.headers.companyid;

      const services = await db('services')
        .where('company_id', companyId)
        .select('*');

      return res.json(services);
    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async create(req: TRequest, res: Response) {
    try {
      const companyId = req.headers.companyid;

      const { account_id } = await db('companies')
        .where('id', companyId)
        .select('account_id')
        .first();

      if (req.userId !== account_id) {
        return res.status(401).json({ error: 'Operation not permitted' });
      }

      const {
        name,
        delivery,
        price = 0,
        schedulable = false,
        associated_product = false,
        activated = false,
      } = req.body;

      if (!name || delivery === undefined) {
          return res.status(400).json({ error: 'Invalid data' });
      }

      const id = generateUniqueId();

      await db<IService>('services').insert({
        id,
        name,
        price,
        delivery,
        schedulable,
        associated_product,
        activated,
        company_id: companyId,
      });

      return res.status(201).json({ id });

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async update(req: Request, res: Response) {
    try {

      if (!req.body) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const companyId = req.headers.companyid;
      const serviceId = req.headers.serviceid;

      const { account_id } = await db('companies')
        .where('id', companyId)
        .select('account_id')
        .first();

      if (req.userId !== account_id) {
        return res.status(401).json({ error: 'Operation not permitted' });
      }

      await db('services')
        .where({
          id: serviceId,
          company_id: companyId,
        })
        .update(req.body);

      return res.json({ status: 'updated' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error has occurred' });
    }
  },
}