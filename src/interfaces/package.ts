export interface IPackage {
  [key: string]: any;
  name: string;
  workspaces?: string[];
  wexondcd?: WexondCDOptions;
  dependencies?: string[];
}

export interface WexondCDOptions {
  filter?: string[] | string;
}

export interface PackageDependencyInfo {
  name: string;
  path: string;
  dependencies: string[];
}
