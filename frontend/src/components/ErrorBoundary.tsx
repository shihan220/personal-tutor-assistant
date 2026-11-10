import { Component, type ReactNode } from "react";
import { mockRepository } from "../services/mockRepository";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="panel max-w-md text-center">
          <h1 className="font-heading text-2xl font-bold">
            Let’s get your workspace back
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            Something interrupted this preview. Reload, or restore the fictional
            sample workspace if your saved data is causing trouble.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              className="btn btn-secondary"
              onClick={() => location.reload()}
            >
              Reload workspace
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                mockRepository.reset();
                location.assign("/");
              }}
            >
              Restore sample workspace
            </button>
          </div>
        </div>
      </main>
    ) : (
      this.props.children
    );
  }
}
