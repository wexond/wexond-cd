import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { flags } from '@oclif/command';

import { PackageDependencyInfo, WorkspacePackage } from '../interfaces';
import { ensureDir, pathExists } from '../utils';

export interface DiffData {
  diffWorkspaces: WorkspacePackage[];
  dependencyInfo: PackageDependencyInfo[];
}

const getDiffCachePath = (rootPath: string) => {
  const wexondDir = resolve(rootPath, '.wexond-cd');
  return { dirPath: wexondDir, path: resolve(wexondDir, 'cache.json') };
};

export const createDiffCache = async (rootPath: string, data: DiffData) => {
  const { dirPath, path } = getDiffCachePath(rootPath);

  await ensureDir(dirPath);
  await writeFile(path, JSON.stringify(data), 'utf8');

  return path;
};

export const getDiffCache = async (rootPath: string) => {
  const { path } = getDiffCachePath(rootPath);

  if (await pathExists(path)) {
    const str = await readFile(path, 'utf8');
    return JSON.parse(str) as DiffData;
  }

  return undefined;
};
