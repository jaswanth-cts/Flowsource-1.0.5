import React, { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}


class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("ErrorBoundary caught an error", error);  
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can use your own error logging service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div className="container"><h2>Oops, something went wrong! Please try again later.</h2></div>
    }

    return this.props.children; 
  }
}

// Utility method to wrap specified component within ErrorBoundary
const withErrorBoundary = <T extends object>(Component: React.ComponentType<T>): (React.ComponentType<T>) => {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );  
  WrappedComponent.displayName = `WithErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

export {ErrorBoundary, withErrorBoundary};