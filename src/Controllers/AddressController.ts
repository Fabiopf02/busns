import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { db } from '../database/db';
import { getGeocoding } from '../utils/getGeocoding';
import { IAddress } from './AccountController';

interface IParams {
  account: string;
}

export default {
  async index(req: Request<IParams>, res: Response) {
    try {
      const { account } = req.params;

      const address = await db('address')
        .join('accounts', 'accounts.id', '=', 'address.account_id')
        .andWhere('accounts.id', account)
        .select('address.*');

      return res.json(address);
    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async create(req: Request<ParamsDictionary, any, IAddress>, res: Response) {
    try {
      const { city, neighborhood, zip_code, state, street, number } = req.body;

      if (!city || !neighborhood || !zip_code || !state || !street || !number) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const address = street + ' ' + number + ', ' + neighborhood
        + ', ' + city + ', ' + state + ', ' + zip_code;

      const coords = await getGeocoding(address);

      await db<IAddress>('address').insert({
        city: city,
        number: number,
        state: state,
        street: street,
        zip_code: zip_code,
        neighborhood: neighborhood,
        account_id: req.userId,
        coords,
      });

      return res.status(201).json({ status: 'success' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  }
}
