import { PackageDependencyInfo, WorkspacePackage } from '../interfaces';
import { exec } from '../utils';

export const getPackagesDependencyInfo = (packages: WorkspacePackage[]) => {
  const names = packages.map((r) => r.package.name);

  return packages.map<PackageDependencyInfo>(
    ({ package: { name, dependencies }, path }) => {
      return {
        name,
        path,
        dependencies:
          dependencies != null
            ? Object.keys(dependencies).filter((dep) => names.includes(dep))
            : [],
      };
    },
  );
};

export const execInPackages = async (
  packages: string[],
  depInfo: PackageDependencyInfo[],
  command: string,
  args: string[],
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

    const { dependencies, path } = info;

    for (const dep of dependencies) {
      await execute(dep, [...parentPackages, name]);
    }

    history.push(name);

    console.log(`${name}: ${command} ${args.join('')}`);

    await exec(command, args, { cwd: path });
  };

  for (const name of packages) {
    await execute(name);
  }
};
