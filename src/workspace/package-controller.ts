import { readdir, readFile } from 'fs/promises';
import { resolve } from 'path';

import { IPackage } from '../interfaces';

export const getPackage = async (basePath: string = ''): Promise<IPackage> => {
  const data = await readFile(resolve(basePath, 'package.json'), 'utf8');
  return JSON.parse(data);
};

export const getLerna = async (basePath: string = '') => {
  const data = await readFile(resolve(basePath, 'lerna.json'), 'utf8');
  return JSON.parse(data);
};
