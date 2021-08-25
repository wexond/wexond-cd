import { Command, flags } from '@oclif/command';

import { DIFF_FLAGS } from '../diff/diff-command';
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
    ...DIFF_FLAGS,
  };

  static args = [
    {
      name: 'command',
    },
  ];

  async run() {
    const {
      flags: { path: rootPath, cache, head, origin },
      args: { command },
    } = this.parse(RunCommand);

    this.log(command);

    const { diffWorkspaces, dependencyInfo } = await getRepoDiff(
      rootPath,
      head,
      origin,
      cache,
    );

    await runInPackages(
      diffWorkspaces.map((r) => r.package.name),
      dependencyInfo,
      command,
    );
  }
}
