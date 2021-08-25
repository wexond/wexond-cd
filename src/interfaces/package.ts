export interface IPackage {
  [key: string]: any;
  workspaces?: string[];
  wexondcd?: WexondCDOptions;
}

export interface WexondCDOptions {
  filter?: string[] | string;
}
