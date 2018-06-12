import * as React from "react";
import { NumberedWord } from "./Word";
import { TextClickStrategy } from './TextClickStrategies';

export interface WordCollectorProps {
  words: NumberedWord[];
  wordType: React.ComponentClass | React.StatelessComponent;
  tabIndex?: number;
  clickStrategy: TextClickStrategy;
  className?: string;
}

export class WordCollector<WordT> extends React.Component<WordCollectorProps> {
  /*
   */
  shouldComponentUpdate(nextProps: WordCollectorProps) {
    return true || (
      this.props.words !== nextProps.words &&
      this.props.words.length !== nextProps.words.length
    );
  }
  /**/

  render() {
    const { words, tabIndex, className } = this.props;

    return (
      <div className={className + " wordCollector"} tabIndex={tabIndex}>
        {words.map((word: NumberedWord) => (
          <this.props.wordType
            {...{
              key: word.index,
              index: word.index,
              word: word.word,
              classNames: word.classNames,
              onClick: () => this.props.clickStrategy.onWordClick(word.index),
              onRightClick: () => this.props.clickStrategy.onContextMenu(word.index),
            }}
          />
        ))}
      </div>
    );
  }
}
