import { Command, flags } from '@oclif/command';

import { FLAG_CACHE } from './diff-cache';
import { getRepoDiff } from './diff-controller';

export class DiffCommand extends Command {
  static description = 'diffs packages';

  static examples = [];

  static flags = {
    path: flags.string({
      char: 'p',
      description: 'path to repo',
      default: './',
    }),
    name: flags.boolean({
      char: 'n',
      description: 'output package name',
    }),
    ...FLAG_CACHE,
  };

  static args = [];

  async run() {
    const {
      flags: { path: rootPath, name, cache },
    } = this.parse(DiffCommand);

    const { diffWorkspaces } = await getRepoDiff(rootPath, cache);

    const res: string[] = name
      ? diffWorkspaces.map((r) => r.package.name)
      : diffWorkspaces.map((r) => r.path);

    this.log(res.join('\n'));
  }
}
