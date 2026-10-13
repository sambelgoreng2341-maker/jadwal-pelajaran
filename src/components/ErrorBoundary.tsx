import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-serif font-black text-2xl mb-4">
            II
          </div>
          <h1 className="text-xl font-bold mb-2">Display Jadwal IIQBS Sedang Memuat Ulang</h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Terjadi kendala saat memuat data sesi. Klik tombol di bawah untuk memulihkan ke jadwal standar kurikulum.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            Pulihkan & Buka Jadwal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
