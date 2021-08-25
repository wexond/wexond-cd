import { Command, flags } from '@oclif/command';

import { getRepoDiff } from './diff-controller';

export const DIFF_FLAGS = {
  cache: flags.boolean({
    char: 'c',
    description: 'path to repo',
  }),
  head: flags.string({
    char: 'h',
    description: 'git head',
    default: 'HEAD',
  }),
  origin: flags.string({
    char: 'o',
    description: 'git origin',
    default: 'origin/master',
  }),
};

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
    ...DIFF_FLAGS,
  };

  static args = [];

  async run() {
    const {
      flags: { path: rootPath, name, cache, head, origin },
    } = this.parse(DiffCommand);

    const { diffWorkspaces } = await getRepoDiff(rootPath, head, origin, cache);

    const res: string[] = name
      ? diffWorkspaces.map((r) => r.package.name)
      : diffWorkspaces.map((r) => r.path);

    this.log(res.join('\n'));
  }
}
