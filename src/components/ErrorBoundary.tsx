
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-50 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Bir Hata Oluştu
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Üzgünüz, beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
                  </p>
                  {this.state.error && (
                    <details className="text-left bg-gray-50 p-2 rounded text-sm text-gray-500 mb-4">
                      <summary className="cursor-pointer font-medium">Hata Detayları</summary>
                      <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
                    </details>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={this.handleReset} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tekrar Dene
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Sayfayı Yenile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
