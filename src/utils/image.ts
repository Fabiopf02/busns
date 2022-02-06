import { UploadedFile } from 'express-fileupload';
import admin from '../config/firebase-config';

export async function saveImage(newName: string, image: UploadedFile) {
  const filename = image.name.replace(/\w+[.]/i, newName + '.');

  const file = admin.storage().bucket().file(filename);

  await file.save(image.data, {
    contentType: image.mimetype,
    public: true,
    resumable: false,
  });

  return file.publicUrl();
}

export async function removeImage(name: string) {
  const filename = name.slice(name.length - 53);

  const file = admin.storage().bucket().file(filename);

  await file.delete({ ignoreNotFound: false });
}
