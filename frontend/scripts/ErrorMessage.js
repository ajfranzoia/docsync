import React, { Component, PropTypes } from 'react';

export default function ErrorMessage(props) {
  return (
    <div id="error" className="alert alert-danger">
      <h6>ERROR</h6>
      <h4>{props.error}</h4>
    </div>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.string.isRequired
};
