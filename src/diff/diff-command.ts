import { Command, flags } from '@oclif/command';
import {
  getAllPackages,
  getWorkspacesPaths,
} from '../workspace/workspace-controller';

import { diffRepo } from './diff-controller';

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
  };

  static args = [];

  async run() {
    const {
      flags: { path: rootPath, name },
    } = this.parse(DiffCommand);

    const workspaces = await getWorkspacesPaths(rootPath);
    const packages = await getAllPackages(rootPath, workspaces);

    const diff = await diffRepo(workspaces, packages, { rootPath });

    const res: string[] = name
      ? diff.map((r) => r.package.name)
      : diff.map((r) => r.path);

    this.log(res.join('\n'));
  }
}
