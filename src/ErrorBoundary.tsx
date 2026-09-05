import { Component, type ErrorInfo, type ReactNode } from "react";
type State = { failed: boolean };
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV)
      console.error("画面の描画に失敗しました", error, info.componentStack);
  }
  render() {
    if (this.state.failed)
      return (
        <main>
          <section className="empty">
            <h1>ページを表示できませんでした</h1>
            <p>
              保存されたデータが壊れていても、元のコンテンツは失われません。ページを読み直してください。
            </p>
            <div className="actions">
              <button
                className="button"
                onClick={() => window.location.reload()}
              >
                読み直す
              </button>
              <a className="button secondary" href="/">
                ホームへ戻る
              </a>
            </div>
          </section>
        </main>
      );
    return this.props.children;
  }
}
