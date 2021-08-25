import { PackageDependencyInfo, WorkspacePackage } from '../interfaces';
import { exec } from '../utils';

export const getPackagesDependencyInfo = (packages: WorkspacePackage[]) => {
  const names = packages.map((r) => r.package.name);

  return packages.map<PackageDependencyInfo>(
    ({ package: { name, dependencies, scripts }, path }) => {
      return {
        name,
        path,
        availableScripts: scripts != null ? Object.keys(scripts) : undefined,
        dependencies:
          dependencies != null
            ? Object.keys(dependencies).filter((dep) => names.includes(dep))
            : [],
      };
    },
  );
};

export const runInPackages = async (
  packages: string[],
  depInfo: PackageDependencyInfo[],
  script: string,
) => {
  const history: string[] = [];

  const execute = async (name: string, parentPackages: string[] = []) => {
    if (history.includes(name)) return;

    if (parentPackages.includes(name)) {
      throw new Error(`Cyclic packages ${name}: ${parentPackages}`);
    }

    const info = depInfo.find((r) => r.name === name);

    if (!info) {
      throw new Error(`Couldn't find package ${name}`);
    }

    const { dependencies, path, availableScripts } = info;

    for (const dep of dependencies) {
      await execute(dep, [...parentPackages, name]);
    }

    history.push(name);

    if (availableScripts?.includes(script)) {
      console.log(`${name}: yarn run ${script}`);

      await exec('yarn', ['run', script], {
        cwd: path,
      });
    }
  };

  for (const name of packages) {
    await execute(name);
  }
};
