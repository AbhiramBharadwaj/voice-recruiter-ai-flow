import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Add debug timeout to catch infinite loading
  useEffect(() => {
    const debugTimer = setTimeout(() => {
      if (loading) {
        setDebugMode(true);
        console.log('Auth loading timeout - showing debug info');
      }
    }, 5000); // Show debug after 5 seconds of loading

    return () => clearTimeout(debugTimer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
          {debugMode && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Debug: Auth loading taking longer than expected</p>
              <p>Try refreshing the page</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthForm />
    </div>
  );
}