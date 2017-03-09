import React, { Component } from 'react';
import cookie from 'react-cookie';
import io from 'socket.io-client';

import Navbar from './Navbar';
import DocReader from './DocReader';
import LoginForm from './LoginForm';


export default class App extends Component {

  constructor() {
    super();

    this.state = {
      user: cookie.load('user')
    };

    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
  }

  componentDidMount() {
    let socket = io(`http://localhost:3000`);
  }

  doLogin(user) {
    this.setState({
      user: user
    });

    cookie.save('user', user, { path: '/' });
  }

  doLogout() {
    this.setState({
      user: null
    });

    cookie.remove('user', { path: '/' });
  }

  updatePosition(position) {
    // Make request to update position
  }

  render() {
    if (!this.state.user) {
      return (
        <LoginForm onSubmit={this.doLogin} />
      );
    }

    return (
    	<div>
	      <Navbar username={this.state.user} doLogout={this.doLogout} />
		    <div className="container">
		    	<DocReader updatePosition={this.updatePosition} />
		    </div>
		   </div>
    );
  }
}
