import { Command, flags } from '@oclif/command';

import { diffRepo } from '../diff/diff-controller';
import {
  getAllPackages,
  getWorkspacesPaths,
} from '../workspace/workspace-controller';
import { execInPackages, getPackagesDependencyInfo } from './run-controller';

export class RunCommand extends Command {
  static description = 'runs command in changed packages';

  static examples = [];

  static flags = {
    path: flags.string({
      char: 'p',
      description: 'path to repo',
      default: './',
    }),
  };

  static args = [
    {
      name: 'command',
    },
  ];

  async run() {
    const {
      flags: { path: rootPath },
      args: { command },
    } = this.parse(RunCommand);

    this.log(command);

    const workspaces = await getWorkspacesPaths(rootPath);
    const packages = await getAllPackages(rootPath, workspaces);

    const diff = await diffRepo(workspaces, packages, { rootPath });
    const dependencyInfo = await getPackagesDependencyInfo(packages);

    const [name, ...args] = command.split(' ');

    await execInPackages(
      diff.map((r) => r.package.name),
      dependencyInfo,
      name,
      args,
    );
  }
}
