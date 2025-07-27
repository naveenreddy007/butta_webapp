# Kitchen Module Integration with Event Menu Planner

## Overview

The Kitchen Module seamlessly integrates with the existing Event Menu Planner system to provide a unified experience from event planning to kitchen execution. This integration ensures data consistency, eliminates duplicate entry, and enables real-time synchronization between systems.

## Integration Architecture

### System Components

1. **Integration Service** (`services/integration.service.ts`)
   - Handles data transformation between systems
   - Manages event synchronization
   - Provides business logic for kitchen operations

2. **Data Sync Manager** (`utils/dataSync.ts`)
   - Real-time synchronization between systems
   - Event-driven updates
   - Conflict resolution

3. **System Bridge Component** (`components/integration/SystemBridge.tsx`)
   - User interface for managing integration
   - Event import/export functionality
   - Status monitoring

4. **Cross-System Navigation** (`components/integration/CrossSystemNav.tsx`)
   - Seamless navigation between systems
   - Shared authentication state
   - Consistent user experience

5. **Shared Configuration** (`shared/config/integration.config.ts`)
   - Centralized configuration management
   - Business information consistency
   - Category and role mappings

## Key Features

### 🔄 **Automatic Data Synchronization**

- **Event Creation**: When an event is created in the Menu Planner, it automatically appears in the Kitchen Module
- **Menu Updates**: Changes to menu selections are instantly reflected in kitchen indents
- **Guest Count Changes**: Automatic recalculation of ingredient quantities when guest count changes
- **Real-time Updates**: All changes sync across systems within 2 seconds

### 📊 **Intelligent Data Transformation**

- **Category Mapping**: Menu categories are intelligently mapped to kitchen categories
- **Quantity Calculation**: Automatic calculation of ingredient quantities based on guest count and menu items
- **Buffer Management**: Configurable buffer percentages to prevent shortages
- **Unit Conversion**: Automatic unit conversion for kitchen operations

### 👥 **Unified User Experience**

- **Shared Authentication**: Single sign-on across both systems
- **Role-based Access**: Consistent permissions and access control
- **Cross-system Navigation**: Easy switching between Kitchen and Menu Planner
- **Consistent Branding**: Shared business information and styling

### 🎯 **Smart Kitchen Operations**

- **Auto-indent Creation**: Automatic creation of kitchen indents from menu selections
- **Cooking Task Generation**: Automatic creation of cooking tasks with time estimates
- **Priority Assignment**: Intelligent priority assignment based on dish types
- **Chef Assignment**: Optional automatic chef assignment for tasks

## Data Flow

### Event Creation Flow

```
Menu Planner Event → Integration Service → Kitchen Event → Auto Indent → Cooking Tasks
```

1. **Event Created in Menu Planner**
   - Customer selects menu items
   - Event details are finalized
   - Total cost calculated

2. **Integration Service Processing**
   - Menu items converted to kitchen format
   - Quantities calculated with buffer
   - Categories mapped to kitchen system

3. **Kitchen Event Creation**
   - Event stored in kitchen database
   - Menu items attached as JSON
   - Status set to 'PLANNED'

4. **Auto-indent Generation**
   - Ingredient quantities calculated
   - Stock availability checked
   - Indent items created

5. **Cooking Task Creation**
   - Tasks generated for each dish
   - Time estimates calculated
   - Priorities assigned

### Real-time Sync Flow

```
Menu Planner Change → Sync Event → Kitchen Update → Notification
```

1. **Change Detection**: System detects changes in Menu Planner
2. **Sync Event**: Change event is created and queued
3. **Kitchen Update**: Kitchen Module receives and processes update
4. **Notification**: Users are notified of changes

## Configuration

### Integration Settings

```typescript
const integrationConfig = {
  sync: {
    enabled: true,
    realTimeUpdates: true,
    autoCreateIndents: true,
    autoAssignChefs: false,
    bufferPercentage: 10,
    syncInterval: 5000
  }
};
```

### Category Mapping

```typescript
const categoryMapping = {
  'starters': 'Appetizers',
  'biryanis': 'Main Course',
  'curries': 'Main Course',
  'breads': 'Breads',
  'desserts': 'Desserts',
  'beverages': 'Beverages'
};
```

### Quantity Rules

```typescript
const quantityRules = {
  baseQuantities: {
    'Appetizers': { vegetarian: 0.1, nonVegetarian: 0.15, unit: 'kg' },
    'Main Course': { biryani: 0.25, curry: 0.2, unit: 'kg' },
    'Breads': { quantity: 2, unit: 'pieces' },
    'Desserts': { quantity: 0.1, unit: 'kg' },
    'Beverages': { quantity: 0.2, unit: 'liters' }
  }
};
```

## API Integration

### Event Synchronization

```typescript
// Create kitchen event from menu planner data
const { data, error } = await IntegrationService.createKitchenEvent(eventData);

// Sync event updates
await IntegrationService.syncEventUpdate(eventId, updates);

// Create cooking tasks
await IntegrationService.createCookingTasks(eventId, chefId);
```

### Real-time Subscriptions

```typescript
// Subscribe to kitchen event changes
const subscription = DataSyncManager.subscribeToEvent(eventId, (event) => {
  console.log('Event updated:', event);
});

// Cleanup subscription
subscription.unsubscribe();
```

## User Interface

### System Bridge

The System Bridge component provides a user-friendly interface for:

- Viewing recent events from Menu Planner
- Importing events to Kitchen Module
- Monitoring sync status
- Managing integration settings

### Cross-System Navigation

The Cross-System Navigation component enables:

- Quick switching between systems
- Consistent user experience
- Shared authentication state
- System status indicators

## Business Logic

### Quantity Calculation Algorithm

```typescript
function calculateQuantities(menuItems, guestCount) {
  const calculations = {};
  
  menuItems.forEach(item => {
    const baseQuantity = getBaseQuantityPerPerson(item.category, item.name);
    const totalQuantity = baseQuantity * guestCount;
    const bufferedQuantity = totalQuantity * (1 + bufferPercentage / 100);
    
    // Aggregate similar items
    const key = `${item.name}-${item.category}`;
    if (calculations[key]) {
      calculations[key].quantity += bufferedQuantity;
    } else {
      calculations[key] = {
        itemName: item.name,
        category: item.category,
        quantity: Math.ceil(bufferedQuantity),
        unit: getUnitForItem(item.category, item.name)
      };
    }
  });
  
  return Object.values(calculations);
}
```

### Cooking Time Estimation

```typescript
function estimateCookingTime(category, dishName) {
  const timeMap = {
    'Appetizers': 30,
    'Main Course': dishName.includes('biryani') ? 90 : 60,
    'Breads': 20,
    'Desserts': 45,
    'Beverages': 15
  };
  
  return timeMap[category] || 45;
}
```

## Security Considerations

### Data Protection

- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Consistent permissions across systems
- **Data Validation**: Input validation and sanitization
- **Audit Logging**: Track all integration activities

### Authentication

- **Shared Sessions**: Single sign-on across systems
- **Token Validation**: Secure token-based authentication
- **Permission Checks**: Validate permissions for cross-system access
- **Session Management**: Secure session handling

## Monitoring and Troubleshooting

### Sync Status Monitoring

```typescript
const status = DataSyncManager.getSyncStatus();
console.log('Sync Status:', {
  isInitialized: status.isInitialized,
  activeSubscriptions: status.activeSubscriptions,
  lastSyncTime: status.lastSyncTime
});
```

### Error Handling

```typescript
try {
  await IntegrationService.createKitchenEvent(eventData);
} catch (error) {
  console.error('Integration error:', error);
  // Handle error appropriately
}
```

### Common Issues

1. **Sync Failures**
   - Check network connectivity
   - Verify database permissions
   - Review error logs

2. **Data Inconsistencies**
   - Force sync all events
   - Check category mappings
   - Validate data formats

3. **Permission Errors**
   - Verify user roles
   - Check cross-system access
   - Review authentication state

## Testing

### Integration Tests

```typescript
describe('Integration Service', () => {
  test('should create kitchen event from menu planner data', async () => {
    const eventData = createMockEventData();
    const { data, error } = await IntegrationService.createKitchenEvent(eventData);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe(eventData.name);
  });
});
```

### Manual Testing

1. **Event Creation Flow**
   - Create event in Menu Planner
   - Verify event appears in Kitchen Module
   - Check indent creation
   - Validate cooking tasks

2. **Sync Testing**
   - Update event in Menu Planner
   - Verify changes sync to Kitchen
   - Test real-time updates
   - Check conflict resolution

3. **User Experience**
   - Test cross-system navigation
   - Verify shared authentication
   - Check consistent branding
   - Validate permissions

## Deployment

### Environment Variables

```env
# Integration settings
ENABLE_INTEGRATION=true
SYNC_INTERVAL=5000
AUTO_CREATE_INDENTS=true
BUFFER_PERCENTAGE=10

# Cross-system URLs
MENU_PLANNER_URL=https://menu.buttaconvention.com
KITCHEN_MODULE_URL=https://kitchen.buttaconvention.com
```

### Database Setup

1. Run integration migrations
2. Set up cross-system permissions
3. Configure real-time subscriptions
4. Test connectivity

### Production Checklist

- [ ] Integration configuration validated
- [ ] Real-time sync tested
- [ ] Cross-system navigation working
- [ ] Permissions configured correctly
- [ ] Error handling implemented
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] User training completed

## Future Enhancements

### Planned Features

1. **Advanced Sync Options**
   - Selective sync by event type
   - Batch sync operations
   - Conflict resolution UI

2. **Enhanced Analytics**
   - Cross-system reporting
   - Integration performance metrics
   - Usage analytics

3. **Mobile Integration**
   - Mobile app sync
   - Offline capabilities
   - Push notifications

4. **Third-party Integrations**
   - POS system integration
   - Supplier management
   - Customer feedback

## Support

For integration-related issues:

1. Check the integration status in Kitchen Module
2. Review sync logs and error messages
3. Verify configuration settings
4. Test with sample data
5. Contact system administrator

---

**Integration Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatibility**: Kitchen Module v1.0.0, Menu Planner v1.0.0