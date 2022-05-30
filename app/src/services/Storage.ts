import * as Minio from 'minio';
import constants from '../constants';

const minioClient = new Minio.Client({
  endPoint: constants.MINIO_HOST,
  port: +constants.MINIO_PORT,
  useSSL: false, // todo: make ssl work!
  accessKey: constants.MINIO_ACCESS_KEY,
  secretKey: constants.MINIO_SECRET_KEY,
});

class Storage {
  private static client: Minio.Client;

  private constructor() {
    Storage.client = minioClient;
  }

  static getClient() {
    if (!Storage.client) {
      new Storage();
    }
    return Storage.client;
  }
}

export default Storage;
