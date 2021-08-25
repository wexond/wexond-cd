import { readdir } from 'fs/promises';
import { resolve } from 'path';

import { WorkspacePackage } from '../interfaces';
import { getPackage, getLerna } from './package-controller';

export const getWorkspacePackages = async (
  rootPath: string,
  workspacePath: string,
): Promise<WorkspacePackage[]> => {
  const absolutePath = resolve(rootPath, workspacePath);
  const dirs = await readdir(absolutePath);

  return Promise.all(
    dirs.map(async (path) => {
      const packagePath = resolve(absolutePath, path);

      return {
        path: packagePath,
        relativePath: `${workspacePath}/${path}`,
        package: await getPackage(packagePath),
      };
    }),
  );
};

export const getAllPackages = async (
  rootPath: string,
  workspaces: string[],
): Promise<WorkspacePackage[]> => {
  const packages: WorkspacePackage[] = [];

  await Promise.all(
    workspaces.map(async (workspacePath) => {
      const workspacePackages = await getWorkspacePackages(
        rootPath,
        workspacePath,
      );

      packages.push(...workspacePackages);
    }),
  );

  return packages;
};

export const getWorkspacesPaths = async (
  repoPath: string,
): Promise<string[]> => {
  const main = await getPackage(repoPath);
  let workspaces = main?.workspaces;

  if (workspaces == null) {
    const lerna = await getLerna(repoPath);

    if (lerna?.packages == null) {
      throw new Error(
        'No workspaces found in both package.json and lerna.json',
      );
    }

    workspaces = lerna.packages as string[];
  }

  return workspaces.map((r) => r.split('/*')[0]);
};
