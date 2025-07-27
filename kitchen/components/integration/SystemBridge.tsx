'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  ChefHat, 
  ExternalLink,
  Sync,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { IntegrationService, EventData } from '../../services/integration.service';
import { UserRole } from '../../types';

interface SystemBridgeProps {
  className?: string;
}

export function SystemBridge({ className }: SystemBridgeProps) {
  const { kitchenUser, hasPermission } = useAuth();
  const [recentEvents, setRecentEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Mock data for demonstration - in real implementation, this would come from the event-menu-planner
  const mockEvents: EventData[] = [
    {
      id: 'event-001',
      name: 'Sharma Wedding Reception',
      date: new Date('2024-02-15'),
      guestCount: 250,
      eventType: 'Wedding Reception',
      menuSelections: [
        {
          item: {
            id: 'biryani-001',
            name: 'Hyderabadi Chicken Dum Biryani',
            description: 'Authentic Hyderabadi biryani',
            price: 280,
            category: 'biryanis',
            available: true
          },
          quantity: 250
        }
      ],
      customerInfo: {
        name: 'Rajesh Sharma',
        phone: '+91 9876543210',
        email: 'rajesh@example.com'
      },
      totalAmount: 70000,
      status: 'confirmed'
    },
    {
      id: 'event-002',
      name: 'Corporate Annual Meet',
      date: new Date('2024-02-18'),
      guestCount: 150,
      eventType: 'Corporate Event',
      menuSelections: [
        {
          item: {
            id: 'biryani-003',
            name: 'Vegetable Biryani',
            description: 'Fragrant vegetable biryani',
            price: 220,
            category: 'biryanis',
            available: true
          },
          quantity: 150
        }
      ],
      customerInfo: {
        name: 'Tech Solutions Pvt Ltd',
        phone: '+91 9876543211'
      },
      totalAmount: 45000,
      status: 'planned'
    }
  ];

  useEffect(() => {
    // In real implementation, fetch from event-menu-planner API
    setRecentEvents(mockEvents);
  }, []);

  const handleCreateKitchenEvent = async (eventData: EventData) => {
    if (!hasPermission(UserRole.KITCHEN_MANAGER)) {
      return;
    }

    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      const { data, error } = await IntegrationService.createKitchenEvent(eventData);
      
      if (error) {
        console.error('Error creating kitchen event:', error);
        setSyncStatus('error');
      } else {
        console.log('Kitchen event created:', data);
        setSyncStatus('success');
        
        // Auto-create cooking tasks if configured
        if (data) {
          await IntegrationService.createCookingTasks(data.id);
        }
      }
    } catch (error) {
      console.error('Error in kitchen event creation:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
      
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const getStatusColor = (status: EventData['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <Sync className=\"h-4 w-4 animate-spin\" />;
      case 'success': return <CheckCircle className=\"h-4 w-4 text-green-600\" />;
      case 'error': return <AlertCircle className=\"h-4 w-4 text-red-600\" />;
      default: return null;
    }
  };

  if (!kitchenUser) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-2xl font-bold text-gray-900\">Event Integration</h2>
          <p className=\"text-gray-600\">Sync events from menu planner to kitchen operations</p>
        </div>
        
        <div className=\"flex items-center space-x-2\">
          {getSyncStatusIcon()}
          {syncStatus === 'success' && (
            <span className=\"text-sm text-green-600\">Synced successfully</span>
          )}
          {syncStatus === 'error' && (
            <span className=\"text-sm text-red-600\">Sync failed</span>
          )}
        </div>
      </div>

      {/* Business Info Consistency */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <ExternalLink className=\"h-5 w-5\" />
            <span>System Integration Status</span>
          </CardTitle>
          <CardDescription>
            Integration with Butta Convention Event Menu Planner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-3 h-3 bg-green-500 rounded-full\"></div>
              <div>
                <p className=\"font-medium\">Business Info</p>
                <p className=\"text-sm text-gray-600\">Synchronized</p>
              </div>
            </div>
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-3 h-3 bg-green-500 rounded-full\"></div>
              <div>
                <p className=\"font-medium\">Menu Data</p>
                <p className=\"text-sm text-gray-600\">Connected</p>
              </div>
            </div>
            <div className=\"flex items-center space-x-3\">
              <div className=\"w-3 h-3 bg-green-500 rounded-full\"></div>
              <div>
                <p className=\"font-medium\">User Auth</p>
                <p className=\"text-sm text-gray-600\">Shared Session</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events from Menu Planner */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events from Menu Planner</CardTitle>
          <CardDescription>
            Events that can be imported to kitchen operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className=\"text-center py-8\">
              <Calendar className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
              <p className=\"text-gray-600\">No recent events found</p>
              <p className=\"text-sm text-gray-500\">Events from the menu planner will appear here</p>
            </div>
          ) : (
            <div className=\"space-y-4\">
              {recentEvents.map((event) => (
                <div key={event.id} className=\"border rounded-lg p-4 hover:bg-gray-50 transition-colors\">
                  <div className=\"flex items-start justify-between\">
                    <div className=\"flex-1\">
                      <div className=\"flex items-center space-x-3 mb-2\">
                        <h3 className=\"font-semibold text-lg\">{event.name}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3\">
                        <div className=\"flex items-center space-x-2\">
                          <Calendar className=\"h-4 w-4\" />
                          <span>{event.date.toLocaleDateString()}</span>
                        </div>
                        <div className=\"flex items-center space-x-2\">
                          <Users className=\"h-4 w-4\" />
                          <span>{event.guestCount} guests</span>
                        </div>
                        <div className=\"flex items-center space-x-2\">
                          <ChefHat className=\"h-4 w-4\" />
                          <span>{event.menuSelections.length} menu items</span>
                        </div>
                      </div>
                      
                      <div className=\"text-sm text-gray-600\">
                        <p><strong>Customer:</strong> {event.customerInfo.name}</p>
                        <p><strong>Event Type:</strong> {event.eventType}</p>
                        <p><strong>Total Amount:</strong> ₹{event.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className=\"flex flex-col space-y-2 ml-4\">
                      {hasPermission(UserRole.KITCHEN_MANAGER) && (
                        <Button
                          onClick={() => handleCreateKitchenEvent(event)}
                          disabled={isLoading}
                          className=\"bg-orange-600 hover:bg-orange-700\"
                        >
                          <ArrowRight className=\"h-4 w-4 mr-2\" />
                          Import to Kitchen
                        </Button>
                      )}
                      
                      <Button variant=\"outline\" size=\"sm\">
                        <ExternalLink className=\"h-4 w-4 mr-2\" />
                        View in Menu Planner
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Features */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
        <Card>
          <CardHeader>
            <CardTitle>Auto-Sync Features</CardTitle>
            <CardDescription>Automatic synchronization capabilities</CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-3\">
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Auto-create indents</span>
              <Badge variant=\"secondary\">Enabled</Badge>
            </div>
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Quantity calculation</span>
              <Badge variant=\"secondary\">10% buffer</Badge>
            </div>
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Cooking task creation</span>
              <Badge variant=\"secondary\">Auto</Badge>
            </div>
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Real-time updates</span>
              <Badge variant=\"secondary\">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Consistency</CardTitle>
            <CardDescription>Shared information across systems</CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-3\">
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Business branding</span>
              <Badge className=\"bg-green-100 text-green-800\">Synced</Badge>
            </div>
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Menu categories</span>
              <Badge className=\"bg-green-100 text-green-800\">Mapped</Badge>
            </div>
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">User sessions</span>
              <Badge className=\"bg-green-100 text-green-800\">Shared</Badge>
            </div>
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm\">Contact info</span>
              <Badge className=\"bg-green-100 text-green-800\">Consistent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Alert */}
      {!hasPermission(UserRole.KITCHEN_MANAGER) && (
        <Alert>
          <AlertCircle className=\"h-4 w-4\" />
          <AlertDescription>
            You need Kitchen Manager or Admin permissions to import events from the menu planner.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}