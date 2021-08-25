import minimatch from 'minimatch';
import { WorkspacePackage } from '../interfaces';
import { exec } from '../utils';

export interface DiffOptions {
  gitCurrent?: string;
  gitPrevious?: string;
  rootPath?: string;
}

export const runGitDiff = async (
  workspaces: string[],
  gitCurrent: string,
  gitPrevious: string,
  rootPath?: string,
) => {
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

export const diffRepo = async (
  workspaces: string[],
  packages: WorkspacePackage[],
  { gitCurrent = 'HEAD', gitPrevious = 'origin/master', rootPath }: DiffOptions,
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
