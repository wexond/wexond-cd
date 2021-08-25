import minimatch from 'minimatch';

import { WorkspacePackage } from '../interfaces';
import { getPackagesDependencyInfo } from '../run/run-controller';
import { exec } from '../utils';
import {
  getWorkspacesPaths,
  getAllPackages,
} from '../workspace/workspace-controller';
import { createDiffCache, DiffData, getDiffCache } from './diff-cache';

export interface DiffOptions {
  gitCurrent: string;
  gitPrevious: string;
  rootPath?: string;
}

export const runGitDiff = async (
  workspaces: string[],
  gitCurrent: string,
  gitPrevious: string,
  rootPath?: string,
) => {
  console.log(`Running git diff ${gitCurrent} ${gitPrevious}`);

  const { stdout } = await exec(
    'git',
    [
      'diff-tree',
      '-r',
      '--name-only',
      '--no-commit-id',
      gitCurrent,
      gitPrevious,
      '--',
      workspaces.join(' '),
    ],
    { cwd: rootPath, shell: true, std: false },
  );

  return stdout.split('\n');
};

const getPackageWorkingDir = (path: string, relativePath: string) => {
  return path.split(relativePath).slice(1).join().slice(1);
};

export const diffWorkspaces = async (
  workspaces: string[],
  packages: WorkspacePackage[],
  { gitCurrent, gitPrevious, rootPath }: DiffOptions,
) => {
  const diff = await runGitDiff(workspaces, gitCurrent, gitPrevious, rootPath);
  const filtered: WorkspacePackage[] = [];

  const cache: string[] = [];

  diff.forEach((diffPath) => {
    const matched = packages.find((p) => diffPath.startsWith(p.relativePath));

    if (!matched) return;

    if (!cache.includes(matched.relativePath)) {
      const filter = matched.package.wexondcd?.filter;
      const workingDir = getPackageWorkingDir(diffPath, matched.relativePath);

      if (
        !filter ||
        (typeof filter === 'string' ? [filter] : filter).some((rule) =>
          minimatch(workingDir, rule),
        )
      ) {
        cache.push(matched.relativePath);
        filtered.push(matched);
      }
    }
  });

  return filtered;
};

export const getRepoDiff = async (
  rootPath: string,
  head: string,
  origin: string,
  cache?: boolean,
): Promise<DiffData> => {
  let data = cache ? await getDiffCache(rootPath) : undefined;

  if (data == null) {
    const paths = await getWorkspacesPaths(rootPath);
    const packages = await getAllPackages(rootPath, paths);

    const workspaces = await diffWorkspaces(paths, packages, {
      rootPath,
      gitCurrent: head,
      gitPrevious: origin,
    });
    const dependencyInfo = getPackagesDependencyInfo(packages);

    data = {
      dependencyInfo,
      diffWorkspaces: workspaces,
    };

    if (cache) {
      await createDiffCache(rootPath, data);
    }
  }

  return data;
};
