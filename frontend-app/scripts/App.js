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
      isUpdatingPosition: false,
      users: null
    };

    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.onPositionUpdated = this.onPositionUpdated.bind(this);
    this.handleUserConnected = this.handleUserConnected.bind(this);
    this.handleUserDisconnected = this.handleUserDisconnected.bind(this);
  }

  componentDidMount() {
    let socket = io(`http://localhost:3000`);
    this.socket = socket;

    socket.on('loginSuccess', this.handleLoginSuccess);
    socket.on('positionUpdated', this.onPositionUpdated);
    socket.on('userConnected', this.handleUserConnected);
    socket.on('userDisconnected', this.handleUserDisconnected);

    let user = cookie.load('user');
    if (user) {
      this.doLogin(user);
    }
  }

  /**
   * Start user login against the server
   */
  doLogin(user) {
    this.socket.emit('login', user);

    this.setState({
      user
    });
  }

  /**
   * Update state and remove user cookie when a logout is carried out
   */
  doLogout() {
    let user = this.state.user;

    this.setState({
      user: null,
      isLoggedIn: false
    });

    cookie.remove('user', { path: '/' });

    this.socket.emit('logout', user);
  }

  /**
   * Send new position to server when user scrolls.
   * Ignore scrolling if there's an ongoing position update
   * @param  {int} position
   */
  updatePosition(position) {
    if (this.state.isUpdatingPosition) {
      return;
    }

    this.socket.emit('updatePosition', position);

    console.log(`Sent new scroll position ${position}`);
  }

  /**
   * When a new reading position is received, update the current window scroll
   * position, preventing another scroll event by using the `isUpdatingPosition`
   * state flag.
   * @param  {int} position
   */
  onPositionUpdated(position) {
    console.log(`Received new scroll position of ${position}`);

    this.setState({
      isUpdatingPosition: true
    }, () => {
      document.body.scrollTop = position;

      this.setState({
        isUpdatingPosition: false
      });
    });
  }

  /**
   * After a successful login, update state, store user cookie and
   * update given reading position
   * @param  {Object} response Server response with position and users
   */
  handleLoginSuccess(response) {
    console.log(`User ${this.state.user} successfully logged in (other ${response.users.length} users connected)`);

    this.setState({
      isLoggedIn: true,
      users: response.users
    });

    cookie.save('user', this.state.user, { path: '/' });

    this.onPositionUpdated(response.position);
  }

  /**
   * Add user to list of users and update state
   * @param  {string} user
   */
  handleUserConnected(user) {
    console.log(`User ${user} connected`);

    this.setState({
      users: this.state.users.concat([user])
    });
  }

  /**
   * Remove user from list of users and update state
   * @param  {string} user
   */
  handleUserDisconnected(user) {
    console.log(`User ${user} disconnected`);

    this.setState({
      users: this.state.users.filter(u => u !== user)
    });
  }

  render() {
    if (!this.state.isLoggedIn) {
      return (
        <LoginForm onSubmit={this.doLogin} />
      );
    }

    return (
    	<div>
	      <Navbar username={this.state.user} users={this.state.users} doLogout={this.doLogout} />
		    <div className="container">
		    	<DocReader updatePosition={this.updatePosition} />
		    </div>
		   </div>
    );
  }
}
