import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { routes } from './routes';
import fileUpload from 'express-fileupload';

const app = express();

app.use(fileUpload({ preserveExtension: true }));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

export { app };
