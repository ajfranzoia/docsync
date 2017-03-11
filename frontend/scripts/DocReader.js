import React, { Component, PropTypes } from 'react';
import debounce from './utils/debounce';
import DocContent from './DocContent';
import appConfig from 'appConfig';

export default class DocReader extends Component {

  constructor() {
    super();

    this.state = {
      scrollPosition: 0
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

	componentDidMount() {
    window.addEventListener('scroll', debounce(this.handleScroll, appConfig.readingDebounceDelay, () => {
      // Don't call the handleScroll function if a position update is ongoing
      return !this.props.isUpdatingPosition;
    }));
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
