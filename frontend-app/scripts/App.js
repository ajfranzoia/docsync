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
      isLoggedIn: false,
      isUpdatingPosition: false
    };

    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.onPositionUpdated = this.onPositionUpdated.bind(this);
  }

  componentDidMount() {
    let socket = io(`http://localhost:3000`);
    this.socket = socket;

    socket.on('loginSuccess', this.handleLoginSuccess);
    socket.on('positionUpdated', this.onPositionUpdated);

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
    if (this.state.isUpdatingPosition) {
      return;
    }

    this.socket.emit('updatePosition', position);
  }

  onPositionUpdated(position) {
    this.setState({
      isUpdatingPosition: true
    }, () => {
      document.body.scrollTop = position;

      this.setState({
        isUpdatingPosition: false
      });
    });


  }

  handleLoginSuccess(response) {
    this.setState({
      isLoggedIn: true
    });

    cookie.save('user', this.state.user, { path: '/' });

    this.onPositionUpdated(response.position);
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
