import React, { Component } from 'react';
import Navbar from './Navbar';
import DocReader from './DocReader';
import io from 'socket.io-client';

export default class App extends Component {

	componentDidMount() {
		let socket = io(`http://localhost:3000`);
	}

  render() {
    return (
    	<div>
	      <Navbar />
		    <div className="container">
		    	<DocReader />
		    </div>
		   </div>
    );
  }
}
