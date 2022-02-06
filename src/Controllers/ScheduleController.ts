import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import admin from '../config/firebase-config';
import { db } from '../database/db';
import generateUniqueId from '../utils/generateUniqueId';

interface IParams {
  id: string;
}
interface IQuery {
  c: string;
}
interface ISchedule {
  time: Date;
  date: Date;
}

interface IToken {
  firebase_token: string;
}

interface service {
  name: string;
  requested: string;
  received: string;
}

interface IBody {
  canceled: boolean;
  finished: boolean;
  confirmed: boolean;
}

const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };

export default {
  async index(req: Request<IParams, any, any, IQuery>, res: Response) {
    try {
      const { id } = req.params;
      const { c } = req.query;

      if (c === 'false') {
        const schedule = await db('agendas')
          .join('companies', 'companies.id', '=', 'agendas.received')
          .join('accounts', 'accounts.id', '=', 'companies.account_id')
          .join('services', 'services.id', '=', 'agendas.service_id')
          .andWhere('requested', id)
          .select([
            'agendas.*',
            'accounts.name as company_name',
            'accounts.id as account_id',
            'services.name as service_name',
            'services.delivery',
            'services.associated_product',
            'services.price',
          ])
          .orderBy('agendas.created_at', 'desc');
  
        return res.json(schedule);
      }
      if (c === 'true') {
        const schedule = await db('agendas')
          .join('accounts', 'accounts.id', '=', 'agendas.requested')
          .join('services', 'services.id', '=', 'agendas.service_id')
          .andWhere('received', id)
          .select([
            'agendas.*',
            'accounts.name as user_name',
            'accounts.id as account_id',
            'services.name as service_name',
            'services.delivery',
            'services.associated_product',
            'services.price',
          ])
          .orderBy('agendas.created_at', 'desc');
  
        return res.json(schedule);
      }

    } catch (err) {
      return res.status(500).json({ error: 'An error has occurred' + err });
    }
  },
  async create(req: Request<ParamsDictionary, any, ISchedule>, res: Response) {
    try {
      const service_id = req.headers.serviceid;
      const requested = req.headers.userid;
      const received = req.headers.companyid;
      const { date, time } = req.body;

      if (!date || !received || !requested || !time || !service_id) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const company = await db('companies')
        .join('accounts', 'companies.account_id', '=', 'accounts.id')
        .andWhere('companies.id', received)
        .select<IToken>('accounts.firebase_token')
        .first();

      const message = {
        notification: {
          title: 'Nova Solicitação',
          body: 'Você recebeu uma nova solicitação de serviço'
        }
      };

      admin.messaging().sendToDevice(company.firebase_token, message, options);

      const id = generateUniqueId();

      await db('agendas').insert({
        id,
        date,
        received,
        time,
        requested,
        service_id,
      });

      return res.status(201).json({ id });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error has occurred' });
    }
  },

  async update(req: Request<ParamsDictionary, any, IBody>, res: Response) {
    try {
      const scheduleId = req.headers.scheduleid;

      if (!req.body) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const { name } = await db('accounts')
        .where('id', req.userId)
        .select('name')
        .first();

      const service = await db('services')
        .join('agendas', 'agendas.service_id', '=', 'services.id')
        .andWhere('agendas.id', scheduleId)
        .select<service>([
          'services.name',
          'agendas.requested',
          'agendas.received',
        ])
        .first();

      const forUser = service.requested === req.userId
          ? undefined
          : service.requested;
      let firebase_token = undefined;

      if (!forUser) {
        const res = await db('companies')
          .join('accounts', 'accounts.id', '=', 'companies.account_id')
          .andWhere('companies.id', service.received)
          .select<IToken>('accounts.firebase_token')
          .first();
        firebase_token = res.firebase_token;
      }

      if (!firebase_token) {
        const user = await db('accounts')
          .where('id', forUser)
          .select<IToken>('firebase_token')
          .first();

        firebase_token = user.firebase_token;
      }

      const message = {
        notification: {
          title: 'Atualização de agenda',
          body: name + ' ' + `atualizou a agenda '${service.name}'`,
        },
        data: {
          token: firebase_token,
        },
      };

      admin.messaging().sendToDevice(firebase_token, message, options);

      await db('agendas')
        .where('id', scheduleId)
        .update(req.body);
      
      return res.json({ status: 'success' });

    } catch (err) {
      return res.status(500).json({ error: 'An internal error has occurred' });
    }
  }
}
