import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 font-['Nunito']"
          style={{
            background: "var(--color-bg-primary)",
            color: "var(--color-text-primary)",
          }}
        >
          <div
            className="max-w-md w-full rounded-3xl border-4 p-8 text-center"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-bg-secondary)",
            }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--color-game-red)",
                border: "3px solid var(--color-border)",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight mb-2">
              Something went wrong
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              The app hit a snag. Tap below to try again or reload the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="py-3 px-6 rounded-2xl font-black uppercase tracking-widest text-white transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--color-game-blue)",
                  boxShadow: "0 4px 0 var(--color-game-blue-dark)",
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3 px-6 rounded-2xl font-black uppercase tracking-widest text-white transition-all active:scale-95 border-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg-primary)",
                  color: "var(--color-text-primary)",
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
