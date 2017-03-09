import React, { Component } from 'react';


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
          <a className="navbar-brand" href="#">DocSync</a>
        </div>
        <div id="navbar" className="collapse navbar-collapse">

          <p className="navbar-text">Welcome back <strong>{props.username}</strong>!</p>
          <div className="nav navbar-nav navbar-right">
            <button type="button" className="btn btn-warning btn-sm navbar-btn" onClick={props.doLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
	);
}


