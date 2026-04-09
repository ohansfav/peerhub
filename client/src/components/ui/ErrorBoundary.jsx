import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error Boundary caught:", error, info);
    this.setState({ info });
    // Optionally send to your backend or logging service
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-700 mb-4">
            Please try refreshing the page. If the problem persists, contact
            support.
          </p>

          {/* Display brief error info to help support */}
          <div className="text-xs text-gray-500 bg-gray-50 border rounded p-2 w-full max-w-lg mb-4">
            <p>
              <strong>Error:</strong> {this.state.error?.message || "Unknown"}
            </p>
          </div>

          <button
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-focus"
            onClick={this.handleReload}
          >
            Reload Page
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Error code:{" "}
            <span className="font-mono">
              {this.state.error?.name || "UnhandledException"}
            </span>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
