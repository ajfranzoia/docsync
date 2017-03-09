import React from 'react';
import { render } from 'react-dom';
import App from './App';

import io from 'socket.io-client';

let socket = io(`http://localhost:3000`)

render(
  <App />,
  document.getElementById('root')
);
