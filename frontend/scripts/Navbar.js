import React, { Component, PropTypes } from 'react';

export default function Navbar(props) {
	return (
    <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand">DocSync</a>
        </div>
        <div id="navbar" className="collapse navbar-collapse">
          <p className="navbar-text">Welcome back <strong>{props.username}</strong>!</p>
          <ul className="nav navbar-nav">
            <li className="dropdown">
              <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                {props.users.length} other users connected
                <span className="caret"></span>
              </a>
              {
                props.users.length ?
                  (
                    <ul className="dropdown-menu">
                      {(
                        props.users.map(function(user) {
                          return (
                            <li key={user}>
                              <a>{user}</a>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  ) : null
              }
            </li>
          </ul>
          <div className="nav navbar-nav navbar-right">
            <p id="challenge-text" className="navbar-text">Challenge for <a href="https://mural.ly" target="_blank">Mural</a></p>
            <button type="button" className="btn btn-warning btn-sm navbar-btn" onClick={props.doLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
	);
}

Navbar.propTypes = {
  username: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  doLogout: PropTypes.func.isRequired
};
