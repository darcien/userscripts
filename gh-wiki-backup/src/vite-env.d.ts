/// <reference types="vite/client" />

type IdbKeyval = {
  get: typeof import("idb-keyval").get;
  update: typeof import("idb-keyval").update;
};

declare global {
  // idb-keyval is an UMD and have TS types but
  // the types is not compatible with our module type.
  // Need to augment manually for now.
  // https://github.com/jakearchibald/idb/issues/94#issuecomment-473321966
  /**
   * Docs: https://github.com/jakearchibald/idb-keyval#usage
   *
   * Missing function types needs to be manually added in vite-env.d.ts.
   */
  var idbKeyval: IdbKeyval;
}

// Make this file a module to make global augment works
export {};
