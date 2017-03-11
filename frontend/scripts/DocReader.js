import React, { Component, PropTypes } from 'react';
import debounce from './utils/debounce';
import DocContent from './DocContent';
import appConfig from 'appConfig';

/**
 * Component that includes DocContent and is in charge of listening to
 * the window scroll event and consequently triggering and update position.
 */
export default class DocReader extends Component {

  constructor() {
    super();

    this.state = {
      scrollPosition: 0
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  /**
   * Once mounted, setup the scroll listener proxied by the debounce utility
   */
	componentDidMount() {
    this.debounceScrollProxy = debounce(this.handleScroll, appConfig.readingDebounceDelay, () => {
      // Don't call the handleScroll function if a position update is ongoing
      return !this.props.isUpdatingPosition;
    });

    window.addEventListener('scroll', this.debounceScrollProxy);
	}

  /**
   * When unmounting remove the proxied scroll listener
   */
  componentWillUnmount() {
    window.removeEventListener('scroll', this.debounceScrollProxy);
  }

  /**
   * On scroll, get the current position and call the updatePosition() prop method
   */
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
