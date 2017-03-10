import React, { Component, PropTypes } from 'react';
import debounce from './utils/debounce';
import DocContent from './DocContent';
import config from 'app_config';

export default class DocReader extends Component {

  constructor() {
    super();

    this.state = {
      scrollPosition: 0
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

	componentDidMount() {
    window.addEventListener('scroll', debounce(this.handleScroll, config.readingDebounceDelay));
	}

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(event) {
    let position = document.body.scrollTop;

    this.setState({
      scrollPosition: position
    });

    this.props.updatePosition(position);
  }

  render() {
    return (
    	<div>
    		<DocContent />
		  </div>
    );
  }
}

DocReader.propTypes = {
  updatePosition: PropTypes.func.isRequired
};
