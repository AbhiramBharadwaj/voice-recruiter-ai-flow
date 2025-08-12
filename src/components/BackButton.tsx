import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const BackButton = () => {
  return (
    <div className="fixed top-6 left-6 z-50">
      <Link to="/">
        <Button 
          variant="secondary" 
          size="sm"
          className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-slate-200 hover:bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  );
};