import * as React from "react";

export { SimpleWord } from "./SimpleWord";
export * from "./NumberedWord";

export interface Word {
  readonly word: string;
  classNames: string[];
}

export interface Clickable {
  onClick: React.MouseEventHandler<HTMLElement>;
  onContextMenu?: React.MouseEventHandler<HTMLElement>;
}
