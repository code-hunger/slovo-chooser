import * as ReactDOM from 'react-dom';
import * as React from 'react';
import App from '../App';

it('renders without crashing', () => {
  const div = document.createElement('div') as HTMLElement;
  ReactDOM.render(<App />, div);
});
