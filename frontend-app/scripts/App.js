import React, { Component } from 'react';
import Navbar from './Navbar';
import DocReader from './DocReader';
import LoginForm from './LoginForm';
import io from 'socket.io-client';

export default class App extends Component {

  constructor() {
    super();

    this.state = {
      user: null
    };

    this.doLogin = this.doLogin.bind(this);
    this.doLogout = this.doLogout.bind(this);
  }

  doLogin(username) {
    this.setState({
      user: username
    });
  }

  doLogout() {
    this.setState({
      user: null
    });
  }

	componentDidMount() {
		let socket = io(`http://localhost:3000`);
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
		    	<DocReader />
		    </div>
		   </div>
    );
  }
}
