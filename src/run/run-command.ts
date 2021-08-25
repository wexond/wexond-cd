import { Command, flags } from '@oclif/command';
import { FLAG_CACHE } from '../diff/diff-cache';
import { getRepoDiff } from '../diff/diff-controller';

import { runInPackages } from './run-controller';

export class RunCommand extends Command {
  static description = 'runs command in changed packages';

  static examples = [];

  static flags = {
    path: flags.string({
      char: 'p',
      description: 'path to repo',
      default: './',
    }),
    ...FLAG_CACHE,
  };

  static args = [
    {
      name: 'command',
    },
  ];

  async run() {
    const {
      flags: { path: rootPath, cache },
      args: { command },
    } = this.parse(RunCommand);

    this.log(command);

    const { diffWorkspaces, dependencyInfo } = await getRepoDiff(
      rootPath,
      cache,
    );

    await runInPackages(
      diffWorkspaces.map((r) => r.package.name),
      dependencyInfo,
      command,
    );
  }
}
