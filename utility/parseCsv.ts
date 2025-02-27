import fs from 'fs';
import { parse } from 'fast-csv';

export const parseAndReturnJSON = async (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ headers: true, trim: true }))
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};
