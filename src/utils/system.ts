import { execSync } from 'child_process';
import execa from 'execa';

export interface ExecOptions {
  cwd?: string;
  shell?: boolean;
  std?: boolean;
}

const DEFAULT_EXEC_OPTIONS: ExecOptions = { std: true };

export const exec = async (
  command: string,
  args: any[],
  opts?: ExecOptions,
) => {
  opts = { ...DEFAULT_EXEC_OPTIONS, ...opts };

  try {
    return await execa(command, args, {
      cwd: opts?.cwd,
      stdout: opts?.std ? process.stdout : undefined,
      stderr: opts?.std ? process.stderr : undefined,
      shell: opts?.shell,
    });
  } catch (err) {
    process.stderr.write(Buffer.from(err.toString()));
    process.exit(1);
  }
};

export const execNode = (command: string, cwd?: string) => {
  return execSync(command, {
    encoding: 'utf8',
    cwd,
    stdio: 'inherit',
  });
};
