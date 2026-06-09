import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children:  ReactNode;
  /** Optional label shown in the error UI (e.g. "Board", "Element") */
  label?:    string;
  /** If true, shows a minimal inline error instead of a full-page fallback */
  inline?:   boolean;
}

interface State {
  hasError: boolean;
  message:  string;
}

/**
 * ErrorBoundary — catches render errors in its subtree and shows a graceful
 * fallback rather than a white screen.
 *
 * Usage:
 *   <ErrorBoundary label="Board">
 *     <Board />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you'd send this to Sentry / your error tracker
    console.error(`[ErrorBoundary:${this.props.label ?? 'unknown'}]`, error, info);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.inline) {
      return (
        <div className={styles.inline}>
          <span>⚠ Render error</span>
          <button onClick={this.reset}>Retry</button>
        </div>
      );
    }

    return (
      <div className={styles.fullPage}>
        <div className={styles.card}>
          <div className={styles.icon}>✕</div>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.subtitle}>
            {this.props.label
              ? `The ${this.props.label} crashed unexpectedly.`
              : 'An unexpected error occurred.'}
          </p>
          <code className={styles.message}>{this.state.message}</code>
          <button className={styles.btn} onClick={this.reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}
