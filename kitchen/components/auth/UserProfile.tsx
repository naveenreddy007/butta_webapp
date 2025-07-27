'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, ChefHat } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

export function UserProfile() {
  const { kitchenUser, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!kitchenUser) return null;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.KITCHEN_MANAGER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.CHEF:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.KITCHEN_MANAGER:
        return 'Manager';
      case UserRole.CHEF:
        return 'Chef';
      default:
        return 'User';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant=\"ghost\" className=\"relative h-10 w-10 rounded-full\">
          <Avatar className=\"h-10 w-10\">
            <AvatarFallback className=\"bg-orange-100 text-orange-700\">
              {getInitials(kitchenUser.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className=\"w-64\" align=\"end\" forceMount>
        <DropdownMenuLabel className=\"font-normal\">
          <div className=\"flex flex-col space-y-2\">
            <div className=\"flex items-center space-x-2\">
              <ChefHat className=\"h-4 w-4 text-orange-600\" />
              <p className=\"text-sm font-medium leading-none\">
                {kitchenUser.name}
              </p>
            </div>
            <p className=\"text-xs leading-none text-muted-foreground\">
              {kitchenUser.email}
            </p>
            <Badge 
              variant=\"secondary\" 
              className={`w-fit text-xs ${getRoleColor(kitchenUser.role)}`}
            >
              {getRoleLabel(kitchenUser.role)}
            </Badge>
            {kitchenUser.phone && (
              <p className=\"text-xs text-muted-foreground\">
                📞 {kitchenUser.phone}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className=\"cursor-pointer\">
          <User className=\"mr-2 h-4 w-4\" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className=\"cursor-pointer\">
          <Settings className=\"mr-2 h-4 w-4\" />
          <span>Preferences</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className=\"cursor-pointer text-red-600 focus:text-red-600\"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className=\"mr-2 h-4 w-4\" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}