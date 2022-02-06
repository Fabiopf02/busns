import { Request, Response } from 'express';
import {  ParamsDictionary} from 'express-serve-static-core';
import { db } from '../database/db';
import generateUniqueId from '../utils/generateUniqueId';
import { saveImage, removeImage } from '../utils/image';

interface IProduct {
  barcode: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  id?: string;
  image?: string;
}

interface IQuery {
  barcode?: string;
}

type TRequest = Request<ParamsDictionary, any, IProduct>;

export default {
  async index(req: Request<ParamsDictionary, any, any, IQuery>, res: Response) {
    try {
      const companyId = req.headers.companyid;

      const { barcode } = req.query;

      if (barcode) {
        const product = await db('products')
        .where({
          company_id: companyId,
          barcode,
        })
        .select('*')
        .first();

        return res.json(product);
      }
      const products = await db('products')
        .where('company_id', companyId)
        .select('*');

      return res.json(products);

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async create(req: TRequest, res: Response) {
    try {
      const companyId = req.headers.companyid;

      const { barcode, image_url, name, price } = req.body;
      const files = req.files;

      if (!image_url || !name || !price) {
        return res.status(400).json({ error: 'Invalid values' });
      }

      const companyName = await db('companies')
        .where('id', companyId)
        .select('segment')
        .first();

      if (!companyName) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const id = generateUniqueId();
      let newImage = null;

      if (!barcode && files) {
        // newImage = await saveImage(companyId + '_' + id, files.image);
      }

      const product: IProduct = await db('products').insert({
        id,
        barcode,
        image_url: newImage || image_url,
        name,
        price: Number(price),
        company_id: companyId,
      });

      return res.status(201).json({ id: product.id });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async update(req: TRequest, res: Response) {
    try {

      if (!req.body) {
        return res.status(400).send();
      }

      const companyId = req.headers.companyid;
      const productId = req.headers.productid;
      const files = req.files;

      const product = await db('products')
      .where('id', productId)
      .select('company_id')
      .first();

      if (!product) {
        return res.status(404).json({ error: 'Product does not exist' });
      }

      if (product.company_id !== companyId) {
        return res.status(403).json({ error: 'Operation not permited' });
      }

      if (files) {
        await removeImage(companyId + '_' + productId);
        const url = await saveImage(companyId + '_' + productId, files.image);
        req.body.image_url = url;
      }

      delete req.body.image;

      await db('products')
        .update(req.body)
        .where({
          id: productId,
          company_id: companyId,
        });

      return res.json({ msg: 'Updated product' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  }
}
