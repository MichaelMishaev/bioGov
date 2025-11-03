'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface HomeButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function HomeButton({
  variant = 'ghost',
  size = 'icon',
  className = '',
  showLabel = false
}: HomeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine the correct home path based on authentication status
  const getHomePath = () => {
    if (user) {
      return '/dashboard';
    }
    return '/';
  };

  const homePath = getHomePath();

  // Don't show home button if we're already on the home page
  if (pathname === homePath) {
    return null;
  }

  const handleClick = () => {
    router.push(homePath);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`${className} home-button`}
      aria-label="חזרה לדף הבית"
      data-testid="home-button"
    >
      <Home className={`w-5 h-5 ${showLabel ? 'ml-2' : ''}`} />
      {showLabel && <span>דף הבית</span>}
    </Button>
  );
}
