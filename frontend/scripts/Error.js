import React, { Component } from 'react';

export default function Error(props) {
  return (
    <div id="error" className="alert alert-danger">
      <h6>ERROR</h6>
      <h4>{props.error}</h4>
    </div>
  );
}
