import { Command } from '@oclif/command';

export default class DiffCommand extends Command {
  static description = 'diffs packages';

  static examples = [];

  static flags = {};

  static args = [];

  async run() {
    const { flags } = this.parse(DiffCommand);

    this.log('xd');
  }
}
