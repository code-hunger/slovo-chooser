import * as React from "react";
import { NumberedWord } from "../Word";
import { TextClickStrategy } from "../TextClickStrategies";
import { range } from "lodash";

export interface WordCollectorProps {
  words: NumberedWord[];
  wordType: React.ComponentClass | React.StatelessComponent;
  tabIndex?: number;
  className?: string;

  onWordClick: (word: number) => void;
  onContextMenu: (word: number) => void;
}

export class WordCollector<WordT> extends React.PureComponent<
  WordCollectorProps
> {
  render() {
    const { words, tabIndex, className, onWordClick, onContextMenu } = this.props;

    return (
      <div className={className + " wordCollector"} tabIndex={tabIndex}>
        {words.map((word: NumberedWord, i: number) => (
          <this.props.wordType
            {...{
              key: word.index,
              index: word.index,
              word: word.word,
              classNames: word.classNames,
              onClick: onWordClick,
              onRightClick: onContextMenu
            }}
          />
        ))}
      </div>
    );
  }
}
