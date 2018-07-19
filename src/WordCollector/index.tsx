import * as React from "react";
import { NumberedWord } from "../Word";
import { TextClickStrategy } from "../TextClickStrategies";
import * as _ from "lodash";

export interface WordCollectorProps {
  words: NumberedWord[];
  wordType: React.ComponentClass | React.StatelessComponent;
  tabIndex?: number;
  clickStrategy: TextClickStrategy;
  className?: string;
}

export class WordCollector<WordT> extends React.PureComponent<WordCollectorProps> {
  private clickHandlers: [
    (wordId: number) => void,
    (wordId: number) => void
  ][] = [];

  constructor(props: WordCollectorProps) {
    super(props);
    this.fillHandlers(props.words.length, props.clickStrategy);
  }

  componentWillReceiveProps(prop: WordCollectorProps) {
    if (prop.clickStrategy !== this.props.clickStrategy) {
      this.clickHandlers = [];
    }
    this.fillHandlers(prop.words.length, prop.clickStrategy);
  }

  fillHandlers(upTo: number, clickStrategy: TextClickStrategy) {
    if(this.clickHandlers.length >= upTo) return;

    _.range(this.clickHandlers.length, upTo).forEach(i =>
      this.clickHandlers.push([
        () => clickStrategy.onWordClick(i),
        () => clickStrategy.onContextMenu(i)
      ])
    );
  }

  render() {
    const { words, tabIndex, className } = this.props;

    return (
      <div className={className + " wordCollector"} tabIndex={tabIndex}>
        {words.map((word: NumberedWord, i: number) => (
          <this.props.wordType
            {...{
              key: word.index,
              index: word.index,
              word: word.word,
              classNames: word.classNames,
              onClick: this.clickHandlers[i][0],
              onRightClick: this.clickHandlers[i][1]
            }}
          />
        ))}
      </div>
    );
  }
}
