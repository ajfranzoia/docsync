import React, { Component } from 'react';
import cookie from 'react-cookie';
import io from 'socket.io-client';
import Navbar from './Navbar';
import DocReader from './DocReader';
import LoginForm from './LoginForm';
import LoadingApp from './LoadingApp';
import ErrorMessage from './ErrorMessage';
import appConfig from 'appConfig';
import events from 'common/events';
import cookieConfig from 'common/cookieConfig';
import errorCodes from 'common/errorCodes';

export default class App extends Component {

  constructor() {
    super();

    this.state = {
      user: null,
      isLoggedIn: false,
      isUpdatingPosition: false,
      users: []
    };

    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.onPositionUpdated = this.onPositionUpdated.bind(this);
    this.handleUserConnected = this.handleUserConnected.bind(this);
    this.handleUserDisconnected = this.handleUserDisconnected.bind(this);
    this.handleSocketError = this.handleSocketError.bind(this);
    this.handleSocketDisconnect = this.handleSocketDisconnect.bind(this);
  }

  componentDidMount() {
    let user = cookie.load(cookieConfig.name);
    if (user) {
      this.doLogin(user);
    }

    // Postpone app initialization flag is a user cookie was found
    // to prevent login form from appearing
    this.setState({
      isInitialized: !user
    });
  }

  /**
   * Start user login against the server
   */
  doLogin(user) {
    cookie.save(cookieConfig.name, user, { path: cookieConfig.path });

    this.setState({
      user
    });

    let socket = io(appConfig.serverUrl);
    this.socket = socket;

    socket.on(events.USER_LOGIN_SUCCESS, this.handleLoginSuccess);
    socket.on(events.POSITION_UPDATED, this.onPositionUpdated);
    socket.on(events.USER_CONNECTED, this.handleUserConnected);
    socket.on(events.USER_DISCONNECTED, this.handleUserDisconnected);
    socket.on('error', this.handleSocketError);
    socket.on('disconnect', this.handleSocketDisconnect);

    socket.emit(events.USER_LOGIN, user);
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

    this.socket.emit(events.USER_LOGOUT, user);
    cookie.remove(cookieConfig.name, { path: cookieConfig.path });
  }

  /**
   * Send new position to server when user scrolls.
   * Ignore scrolling if there's an ongoing position update
   * @param  {int} position
   */
  updatePosition(position) {
    if (this.state.isUpdatingPosition || !this.state.isLoggedIn) {
      return;
    }

    this.socket.emit(events.POSITION_UPDATE, position);

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

      // Setup timeout to wait for browser to update scroll position
      // without triggering a new position update event
      setTimeout(() => {
        this.setState({
          isUpdatingPosition: false
        });
      }, 100);
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
      isInitialized: true,
      isLoggedIn: true,
      users: response.users
    });

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

  /**
   * Handles socket app errors
   * @param  {string} errorCode
   */
  handleSocketError(errorCode) {
    if (errorCode === errorCodes.AUTHENTICATION_ERROR) {
      this.setState({
        error: 'An authentication error ocurred'
      });
      return;
    }

    this.setState({
      error: 'An unhandled error ocurred'
    });
  }

  /**
   * Handles socket disconnections from server
   */
  handleSocketDisconnect() {
    this.setState({
      error: 'Server is gone'
    });
  }

  /**
   * Render app
   */
  render() {
    if (this.state.error) {
      return (
        <Error error={this.state.error} />
      );
    }

    if (!this.state.isInitialized) {
      return (
        <LoadingApp />
      );
    }

    if (!this.state.isLoggedIn) {
      return (
        <LoginForm onSubmit={this.doLogin} />
      );
    }

    return (
    	<div>
	      <Navbar username={this.state.user} users={this.state.users} doLogout={this.doLogout} />
		    <div className="container">
		    	<DocReader updatePosition={this.updatePosition} isUpdatingPosition={this.state.isUpdatingPosition} />
		    </div>
		  </div>
    );
  }
}
