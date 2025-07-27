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
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Calendar, 
  ExternalLink, 
  ArrowLeftRight,
  Home,
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { IntegrationService } from '../../services/integration.service';
import { UserRole } from '../../types';

interface CrossSystemNavProps {
  currentSystem: 'kitchen' | 'menu-planner';
  className?: string;
}

export function CrossSystemNav({ currentSystem, className }: CrossSystemNavProps) {
  const { kitchenUser, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const businessInfo = IntegrationService.getBusinessInfo();

  const handleSystemSwitch = async (targetSystem: 'kitchen' | 'menu-planner') => {
    setIsLoading(true);
    
    try {
      if (targetSystem === 'menu-planner') {
        // Navigate to menu planner (in real implementation, this would be the actual URL)
        window.location.href = '/menu-planner';
      } else {
        // Navigate to kitchen
        window.location.href = '/kitchen';
      }
    } catch (error) {
      console.error('Error switching systems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemIcon = (system: 'kitchen' | 'menu-planner') => {
    return system === 'kitchen' ? (
      <ChefHat className=\"h-4 w-4\" />
    ) : (
      <Calendar className=\"h-4 w-4\" />
    );
  };

  const getSystemName = (system: 'kitchen' | 'menu-planner') => {
    return system === 'kitchen' ? 'Kitchen Module' : 'Menu Planner';
  };

  if (!kitchenUser) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Current System Indicator */}
      <div className=\"flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200\">
        {getSystemIcon(currentSystem)}
        <span className=\"text-sm font-medium text-orange-800\">
          {getSystemName(currentSystem)}
        </span>
        <Badge variant=\"secondary\" className=\"text-xs\">
          Active
        </Badge>
      </div>

      {/* System Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant=\"outline\" size=\"sm\" disabled={isLoading}>
            <ArrowLeftRight className=\"h-4 w-4 mr-2\" />
            Switch System
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className=\"w-64\" align=\"end\">
          <DropdownMenuLabel className=\"flex items-center space-x-2\">
            <img 
              src={businessInfo.logo} 
              alt={businessInfo.name}
              className=\"h-5 w-5\"
            />
            <span>{businessInfo.name}</span>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Kitchen Module */}
          <DropdownMenuItem
            onClick={() => handleSystemSwitch('kitchen')}
            disabled={currentSystem === 'kitchen'}
            className=\"flex items-center space-x-3 p-3\"
          >
            <ChefHat className=\"h-5 w-5 text-orange-600\" />
            <div className=\"flex-1\">
              <p className=\"font-medium\">Kitchen Module</p>
              <p className=\"text-xs text-gray-500\">Cooking operations & inventory</p>
            </div>
            {currentSystem === 'kitchen' && (
              <Badge variant=\"secondary\" className=\"text-xs\">Current</Badge>
            )}
          </DropdownMenuItem>
          
          {/* Menu Planner */}
          <DropdownMenuItem
            onClick={() => handleSystemSwitch('menu-planner')}
            disabled={currentSystem === 'menu-planner'}
            className=\"flex items-center space-x-3 p-3\"
          >
            <Calendar className=\"h-5 w-5 text-blue-600\" />
            <div className=\"flex-1\">
              <p className=\"font-medium\">Menu Planner</p>
              <p className=\"text-xs text-gray-500\">Event planning & menu selection</p>
            </div>
            {currentSystem === 'menu-planner' && (
              <Badge variant=\"secondary\" className=\"text-xs\">Current</Badge>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Quick Actions */}
          <DropdownMenuLabel className=\"text-xs text-gray-500 uppercase tracking-wide\">
            Quick Actions
          </DropdownMenuLabel>
          
          <DropdownMenuItem className=\"flex items-center space-x-3 p-2\">
            <Home className=\"h-4 w-4\" />
            <span className=\"text-sm\">Main Dashboard</span>
          </DropdownMenuItem>
          
          {hasPermission(UserRole.KITCHEN_MANAGER) && (
            <DropdownMenuItem className=\"flex items-center space-x-3 p-2\">
              <Users className=\"h-4 w-4\" />
              <span className=\"text-sm\">Event Integration</span>
            </DropdownMenuItem>
          )}
          
          {hasPermission(UserRole.ADMIN) && (
            <DropdownMenuItem className=\"flex items-center space-x-3 p-2\">
              <Settings className=\"h-4 w-4\" />
              <span className=\"text-sm\">System Settings</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* External Link to Menu Planner */}
      <Button
        variant=\"ghost\"
        size=\"sm\"
        onClick={() => window.open('/menu-planner', '_blank')}
        className=\"text-blue-600 hover:text-blue-700\"
      >
        <ExternalLink className=\"h-4 w-4 mr-2\" />
        Open Menu Planner
      </Button>
    </div>
  );
}