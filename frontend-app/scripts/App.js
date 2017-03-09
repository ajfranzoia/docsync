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
      user: null,
      isLoggedIn: false
    };

    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
  }

  componentDidMount() {
    let socket = io(`http://localhost:3000`);
    this.socket = socket;

    socket.on('loginSuccess', this.handleLoginSuccess);

    let user = cookie.load('user');
    if (user) {
      this.doLogin(user);
    }
  }

  doLogin(user) {
    this.socket.emit('login', user);

    this.setState({
      user
    });
  }

  doLogout() {
    this.setState({
      user: null,
      isLoggedIn: false
    });

    cookie.remove('user', { path: '/' });
  }

  updatePosition(position) {
    this.socket.emit('updatePosition', position);
  }

  onPositionUpdate(position) {
    document.body.scrollTop = position;
  }

  handleLoginSuccess(response) {
    this.setState({
      isLoggedIn: true
    });

    cookie.save('user', this.state.user, { path: '/' });

    this.onPositionUpdate(response.position);
  }

  render() {
    if (!this.state.isLoggedIn) {
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
