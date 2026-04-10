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
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      //return <h1>Something went wrong. Please try again later.</h1>;
      return <div></div>
    }

    return this.props.children; 
  }
}

const withErrorBoundary = (Component: React.ComponentType<any>) => {
    return (props: any) => (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
};
  
export default withErrorBoundary;
