import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import admin from '../config/firebase-config';
import { db } from '../database/db';
import generateUniqueId from '../utils/generateUniqueId';
import { saveImage } from '../utils/image';

interface Image {
  image: string;
}

interface IImg {
  images: string[];
}

export default {
  async create(req: Request, res: Response) {
    try {
      const { company_image } = req.files;
      const companyId = req.headers.companyid;

      if (!companyId) {
        return res.status(401).json({ error: 'An error has occurred' });
      }

      const data = await db('companies')
        .where({
          id: companyId,
          account_id: req.userId,
        })
        .select<IImg>('images')
        .first();

      if (data === undefined) {
        return res.status(400).send();
      }
      const newName = companyId + '_' + generateUniqueId();

      const image_url = await saveImage(newName, company_image);

      if (data.images === null) {
        data.images = [];
      }
      data.images.push(image_url);

      await db('companies')
        .where({
          id: companyId,
          account_id: req.userId,
        })
        .update({ images: data.images });

      return res.status(201).json(image_url);

    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },

  async delete(req: Request<ParamsDictionary, any, Image>, res: Response) {
    try {
      const companyId = req.headers.companyid;
      const { image } = req.body;

      const query = {
        id: companyId,
        account_id: req.userId,
      }

      const companyImages = await db('companies')
        .where(query)
        .select<IImg>('images')
        .first();

      if (!companyImages || !companyImages.images) {
        return res.status(400).json();
      }

      const newImages = companyImages.images.filter(img => img !== image)

      await db('companies')
        .where(query)
        .update('images', newImages);

      const filename = image.slice(image.length - 53);

      const file = admin.storage().bucket().file(filename);

      file.delete({ ignoreNotFound: false });

      return res.status(200).json({ status: 'deleted' });

    } catch(err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  },
};