import { constants } from 'fs';
import { stat, mkdir, access } from 'fs/promises';
import { basename, dirname } from 'path';
import rimraf from 'rimraf';

export const pathExists = async (path: string) => {
  try {
    await access(path, constants.F_OK);
  } catch (err) {
    return false;
  }

  return true;
};

export const getFileSize = (path: string) => {
  return stat(path).then((r) => r.size);
};

export const removeExtension = (filename: string) => {
  return filename.split('.').slice(0, -1).join('.');
};

export const replaceExtension = (path: string, newExt: string) => {
  return dirname(path) + removeExtension(basename(path)) + newExt;
};

export const removeDir = (path: string) => {
  return new Promise<void>((resolve) => {
    rimraf(path, () => {
      resolve();
    });
  });
};

export const ensureDir = async (path: string) => {
  if (!(await pathExists(path))) {
    await mkdir(path, { recursive: true });
    return false;
  }
  return true;
};
