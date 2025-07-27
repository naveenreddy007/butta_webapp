/**
 * Data Synchronization Utilities
 * 
 * Handles real-time synchronization between Kitchen Module and Event Menu Planner
 */

import { supabase } from '../lib/supabase';
import { IntegrationService, EventData } from '../services/integration.service';

export interface SyncEvent {
  type: 'event_created' | 'event_updated' | 'event_deleted' | 'menu_changed' | 'guest_count_changed';
  eventId: string;
  data: any;
  timestamp: Date;
  source: 'menu_planner' | 'kitchen';
}

export interface SyncSubscription {
  id: string;
  unsubscribe: () => void;
}

export class DataSyncManager {
  private static subscriptions: Map<string, SyncSubscription> = new Map();
  private static isInitialized = false;

  /**
   * Initialize data synchronization
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up real-time listeners for kitchen events
      await this.setupKitchenEventSync();
      
      // Set up menu planner event listeners (mock implementation)
      await this.setupMenuPlannerSync();
      
      this.isInitialized = true;
      console.log('Data synchronization initialized');
    } catch (error) {
      console.error('Failed to initialize data sync:', error);
    }
  }

  /**
   * Set up kitchen event synchronization
   */
  private static async setupKitchenEventSync(): Promise<void> {
    const subscription = supabase
      .channel('kitchen-events-sync')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kitchen_events'
      }, (payload) => {
        this.handleKitchenEventChange(payload);
      })
      .subscribe();

    this.subscriptions.set('kitchen-events', {
      id: 'kitchen-events',
      unsubscribe: () => subscription.unsubscribe()
    });
  }

  /**
   * Set up menu planner synchronization (mock implementation)
   */
  private static async setupMenuPlannerSync(): Promise<void> {
    // In a real implementation, this would connect to the menu planner's real-time system
    // For now, we'll simulate it with periodic checks or webhook handlers
    
    const mockSubscription = {
      id: 'menu-planner-events',
      unsubscribe: () => {
        console.log('Menu planner sync unsubscribed');
      }
    };

    this.subscriptions.set('menu-planner-events', mockSubscription);
  }

  /**
   * Handle kitchen event changes
   */
  private static handleKitchenEventChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        this.onKitchenEventCreated(newRecord);
        break;
      case 'UPDATE':
        this.onKitchenEventUpdated(newRecord, oldRecord);
        break;
      case 'DELETE':
        this.onKitchenEventDeleted(oldRecord);
        break;
    }
  }

  /**
   * Handle new kitchen event creation
   */
  private static onKitchenEventCreated(event: any): void {
    console.log('Kitchen event created:', event);
    
    // Notify menu planner about kitchen event creation
    this.notifyMenuPlanner({
      type: 'event_created',
      eventId: event.id,
      data: event,
      timestamp: new Date(),
      source: 'kitchen'
    });
  }

  /**
   * Handle kitchen event updates
   */
  private static onKitchenEventUpdated(newEvent: any, oldEvent: any): void {
    console.log('Kitchen event updated:', { new: newEvent, old: oldEvent });
    
    // Check what changed and notify accordingly
    const changes = this.detectChanges(oldEvent, newEvent);
    
    if (changes.length > 0) {
      this.notifyMenuPlanner({
        type: 'event_updated',
        eventId: newEvent.id,
        data: { changes, event: newEvent },
        timestamp: new Date(),
        source: 'kitchen'
      });
    }
  }

  /**
   * Handle kitchen event deletion
   */
  private static onKitchenEventDeleted(event: any): void {
    console.log('Kitchen event deleted:', event);
    
    this.notifyMenuPlanner({
      type: 'event_deleted',
      eventId: event.id,
      data: event,
      timestamp: new Date(),
      source: 'kitchen'
    });
  }

  /**
   * Detect changes between old and new records
   */
  private static detectChanges(oldRecord: any, newRecord: any): string[] {
    const changes: string[] = [];
    const fieldsToCheck = ['name', 'date', 'guest_count', 'event_type', 'status', 'menu_items', 'assigned_chef'];

    fieldsToCheck.forEach(field => {
      if (JSON.stringify(oldRecord[field]) !== JSON.stringify(newRecord[field])) {
        changes.push(field);
      }
    });

    return changes;
  }

  /**
   * Notify menu planner about changes (mock implementation)
   */
  private static notifyMenuPlanner(syncEvent: SyncEvent): void {
    // In a real implementation, this would send data to the menu planner system
    // This could be via webhooks, message queues, or direct API calls
    
    console.log('Notifying menu planner:', syncEvent);
    
    // Mock webhook call
    if (typeof window !== 'undefined') {
      // Dispatch custom event for menu planner to listen to
      window.dispatchEvent(new CustomEvent('kitchen-sync', {
        detail: syncEvent
      }));
    }
  }

  /**
   * Handle incoming sync events from menu planner
   */
  static async handleMenuPlannerSync(syncEvent: SyncEvent): Promise<void> {
    try {
      switch (syncEvent.type) {
        case 'event_created':
          await this.syncEventFromMenuPlanner(syncEvent.data);
          break;
        case 'event_updated':
          await this.updateEventFromMenuPlanner(syncEvent.eventId, syncEvent.data);
          break;
        case 'event_deleted':
          await this.deleteEventFromMenuPlanner(syncEvent.eventId);
          break;
        case 'menu_changed':
          await this.syncMenuChanges(syncEvent.eventId, syncEvent.data);
          break;
        case 'guest_count_changed':
          await this.syncGuestCountChange(syncEvent.eventId, syncEvent.data);
          break;
      }
    } catch (error) {
      console.error('Error handling menu planner sync:', error);
    }
  }

  /**
   * Sync new event from menu planner
   */
  private static async syncEventFromMenuPlanner(eventData: EventData): Promise<void> {
    const { data, error } = await IntegrationService.createKitchenEvent(eventData);
    
    if (error) {
      console.error('Error syncing event from menu planner:', error);
    } else {
      console.log('Event synced from menu planner:', data);
    }
  }

  /**
   * Update event from menu planner changes
   */
  private static async updateEventFromMenuPlanner(eventId: string, updateData: any): Promise<void> {
    const { error } = await IntegrationService.syncEventUpdate(eventId, updateData);
    
    if (error) {
      console.error('Error updating event from menu planner:', error);
    } else {
      console.log('Event updated from menu planner:', eventId);
    }
  }

  /**
   * Delete event from menu planner
   */
  private static async deleteEventFromMenuPlanner(eventId: string): Promise<void> {
    try {
      // Soft delete or mark as cancelled
      const { error } = await supabase
        .from('kitchen_events')
        .update({ status: 'CANCELLED' })
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event from menu planner:', error);
      } else {
        console.log('Event deleted from menu planner:', eventId);
      }
    } catch (error) {
      console.error('Error in delete operation:', error);
    }
  }

  /**
   * Sync menu changes
   */
  private static async syncMenuChanges(eventId: string, menuData: any): Promise<void> {
    const { error } = await IntegrationService.syncEventUpdate(eventId, {
      menuSelections: menuData.menuSelections
    });
    
    if (error) {
      console.error('Error syncing menu changes:', error);
    } else {
      console.log('Menu changes synced:', eventId);
    }
  }

  /**
   * Sync guest count changes
   */
  private static async syncGuestCountChange(eventId: string, guestData: any): Promise<void> {
    const { error } = await IntegrationService.syncEventUpdate(eventId, {
      guestCount: guestData.guestCount
    });
    
    if (error) {
      console.error('Error syncing guest count changes:', error);
    } else {
      console.log('Guest count changes synced:', eventId);
    }
  }

  /**
   * Subscribe to specific event changes
   */
  static subscribeToEvent(eventId: string, callback: (event: SyncEvent) => void): SyncSubscription {
    const subscriptionId = `event-${eventId}`;
    
    // Set up Supabase subscription for specific event
    const subscription = supabase
      .channel(`event-sync-${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kitchen_events',
        filter: `id=eq.${eventId}`
      }, (payload) => {
        const syncEvent: SyncEvent = {
          type: 'event_updated',
          eventId: eventId,
          data: payload.new,
          timestamp: new Date(),
          source: 'kitchen'
        };
        callback(syncEvent);
      })
      .subscribe();

    const syncSubscription: SyncSubscription = {
      id: subscriptionId,
      unsubscribe: () => {
        subscription.unsubscribe();
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, syncSubscription);
    return syncSubscription;
  }

  /**
   * Get sync status
   */
  static getSyncStatus(): {
    isInitialized: boolean;
    activeSubscriptions: number;
    lastSyncTime?: Date;
  } {
    return {
      isInitialized: this.isInitialized,
      activeSubscriptions: this.subscriptions.size,
      lastSyncTime: new Date() // In real implementation, track actual last sync time
    };
  }

  /**
   * Force sync all events
   */
  static async forceSyncAll(): Promise<{ success: boolean; synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
      // In a real implementation, this would fetch all events from menu planner
      // and sync them with kitchen events
      
      console.log('Force sync initiated');
      
      // Mock sync operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      synced = 5; // Mock number
      
      return { success: true, synced, errors };
    } catch (error) {
      console.error('Error in force sync:', error);
      return { success: false, synced, errors: errors + 1 };
    }
  }

  /**
   * Cleanup all subscriptions
   */
  static cleanup(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.isInitialized = false;
    console.log('Data sync cleanup completed');
  }
}

// Auto-initialize when imported (in browser environment)
if (typeof window !== 'undefined') {
  DataSyncManager.initialize().catch(console.error);
}