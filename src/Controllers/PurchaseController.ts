import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { db } from '../database/db';

interface IQuery {
  purchase: string;
  seller: string;
  buyer: string;
}

interface IPurchase {
  id?: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  schedule_id: string;
}

type TRequest = Request<ParamsDictionary, any, any, IQuery>;

export default {
  async index(req: TRequest, res: Response) {
    try {
      const { purchase, seller, buyer } = req.query;

      if (purchase) {
        const purchases = await db('purchases')
          .join('products', 'products.id', '=', 'purchases.product_id')
          .andWhere('schedule_id', purchase)
          .select([
            'purchases.*',
            'products.name',
            'products.barcode',
            'products.image_url',
          ]);

        res.setHeader('X-Total-Count', purchases.length);

        return res.json(purchases);
      }
      if (seller) {
        const sales = await db('purchases')
          .where('seller_id', seller)
          .select('*');

        res.setHeader('X-Total-Count', sales.length);
        
        return res.json(sales);
      }
      if (buyer) {
        const purchases = await db('purchases')
          .where('buyer_id', buyer)
          .select('*');

        res.setHeader('X-Total-Count', purchases.length);
        
        return res.json(purchases);
      }

      return res.json([]);

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async create(req: Request<ParamsDictionary, any, IPurchase[]>, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      await db('purchases').insert(req.body);

      return res.json({ status: 'success' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error has occurred' });
    }
  }
}
