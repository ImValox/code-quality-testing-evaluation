import PropTypes from 'prop-types';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { error, hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-5 rounded border border-solid border-[#ff0000] bg-[#ffebee] p-5">
          <h2>Something went wrong!</h2>
          <pre className="whitespace-pre-wrap text-[#ff0000]">{this.state.error && this.state.error.toString()}</pre>
          <button
            className="cursor-pointer rounded border-none bg-[#f44336] px-4 py-2 text-white"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

export default ErrorBoundary;
