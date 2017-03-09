import React, { Component, PropTypes } from 'react';


export default class LoginForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: ''
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({
      username: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.username);
  }

  render() {
    return (
      <div id="login-form">
        <div className="container">
          <div className="row">
            <div className="col-xs-4 col-xs-offset-3">
              <form onSubmit={this.handleSubmit}>
                <h3>Sign In</h3>
                <input type="text" className="form-control" onChange={this.handleUsernameChange} placeholder="Username" required />
                <button className="btn btn-primary btn-block" type="submit">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};
