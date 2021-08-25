import { IPackage } from './package';

export interface WorkspacePackage {
  path: string;
  relativePath: string;
  package: IPackage;
}
