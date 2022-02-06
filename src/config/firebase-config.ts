import admin from 'firebase-admin';
import * as serviceAccount from './service-account.json';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
    projectId: serviceAccount.project_id,
  }),
  storageBucket: serviceAccount.bucket,
  projectId: serviceAccount.project_id,
});

export default admin;
