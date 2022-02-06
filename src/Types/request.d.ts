declare namespace Express {
  interface Request {
    userId?: string;
    files?: {
      [index: string]: {
        name: string;
        mv(path: string, callback: (err: any) => void): void;
        mv(path: string): Promise<void>;
        encoding: string;
        mimetype: string;
        data: Buffer;
        tempFilePath: string;
        truncated: boolean;
        size: number;
        md5: string;
      };
    };
  }
}