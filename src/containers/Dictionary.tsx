import * as React from "react";

interface DictionaryProps {
  word: string;
}

export default class extends React.Component<DictionaryProps> {
  render() {
    const src = "http://localhost:3001/showdict?word=" + this.props.word;
    return <iframe src={src} width="100%" />;
  }
}
