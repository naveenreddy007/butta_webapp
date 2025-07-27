# Kitchen Module API

A comprehensive REST API system for managing kitchen operations, events, stock inventory, and cooking tasks.

## 🚀 Quick Start

```typescript
import { KitchenApiRouter, makeApiCall } from './api';

// Make an API call
const response = await makeApiCall('GET', '/api/kitchen/events', {
  token: 'your-auth-token'
});

if (response.success) {
  console.log('Events:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## 📁 Project Structure

```
kitchen/api/
├── index.ts           # Main API router and exports
├── routes.ts          # Base API handler and authentication
├── events.api.ts      # Events management endpoints
├── indents.api.ts     # Indents/requisitions endpoints
├── cooking.api.ts     # Cooking tasks and board endpoints
├── stock.api.ts       # Stock/inventory management endpoints
├── validation.ts      # Input validation utilities
├── testing.ts         # API testing utilities
├── docs.ts           # Documentation generator
└── README.md         # This file
```

## 🔐 Authentication

All API endpoints require authentication via Bearer token:

```typescript
headers: {
  'Authorization': 'Bearer your-jwt-token'
}
```

### User Roles & Permissions

- **ADMIN**: Full access to all endpoints
- **KITCHEN_MANAGER**: Can manage events, stock, indents, and cooking tasks
- **CHEF**: Can view events, update cooking tasks, and view stock

## 📊 API Endpoints

### Events API

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/kitchen/events` | Get all events | All roles |
| GET | `/api/kitchen/events/:id` | Get event by ID | All roles |
| POST | `/api/kitchen/events` | Create new event | Manager+ |
| PUT | `/api/kitchen/events/:id` | Update event | Manager+ |
| DELETE | `/api/kitchen/events/:id` | Delete event | Admin only |
| GET | `/api/kitchen/events/:id/dashboard` | Get event dashboard | All roles |

### Stock API

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/kitchen/stock` | Get all stock items | All roles |
| GET | `/api/kitchen/stock/:id` | Get stock item by ID | All roles |
| POST | `/api/kitchen/stock` | Create stock item | Manager+ |
| PUT | `/api/kitchen/stock/:id` | Update stock item | Manager+ |
| PATCH | `/api/kitchen/stock/:id/quantity` | Update stock quantity | All roles |
| GET | `/api/kitchen/stock/alerts` | Get stock alerts | All roles |
| GET | `/api/kitchen/stock/categories` | Get stock categories | All roles |
| DELETE | `/api/kitchen/stock/:id` | Delete stock item | Admin only |

### Cooking API

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/kitchen/cooking` | Get cooking logs | All roles |
| GET | `/api/kitchen/cooking/:id` | Get cooking log by ID | All roles |
| POST | `/api/kitchen/cooking` | Create cooking task | Manager+ |
| PATCH | `/api/kitchen/cooking/:id/status` | Update cooking status | All roles |
| PATCH | `/api/kitchen/cooking/:id/assign` | Reassign cooking task | Manager+ |
| GET | `/api/kitchen/cooking/board/:eventId` | Get cooking board | All roles |
| DELETE | `/api/kitchen/cooking/:id` | Delete cooking task | Manager+ |

### Indents API

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/kitchen/indents` | Get all indents | All roles |
| GET | `/api/kitchen/indents/:id` | Get indent by ID | All roles |
| POST | `/api/kitchen/indents` | Create indent | Manager+ |
| PUT | `/api/kitchen/indents/:id` | Update indent | Manager+ |
| POST | `/api/kitchen/indents/:id/submit` | Submit indent | Manager+ |
| POST | `/api/kitchen/indents/:id/approve` | Approve indent | Manager+ |
| PATCH | `/api/kitchen/indents/:id/items/:itemId/receive` | Mark item received | All roles |
| DELETE | `/api/kitchen/indents/:id` | Delete indent | Manager+ |

## 🔧 Usage Examples

### Creating an Event

```typescript
const eventData = {
  name: 'Wedding Reception',
  date: '2024-06-15T18:00:00Z',
  guestCount: 150,
  eventType: 'Wedding',
  assignedChef: 'chef-123'
};

const response = await makeApiCall('POST', '/api/kitchen/events', {
  body: eventData,
  token: 'your-auth-token'
});
```

### Getting Stock Alerts

```typescript
const alerts = await makeApiCall('GET', '/api/kitchen/stock/alerts', {
  token: 'your-auth-token'
});

console.log('Low stock items:', alerts.data.lowStock);
console.log('Expiring items:', alerts.data.expiring);
```

### Updating Cooking Task Status

```typescript
const response = await makeApiCall('PATCH', '/api/kitchen/cooking/task-123/status', {
  body: {
    status: 'IN_PROGRESS',
    notes: 'Started preparation'
  },
  token: 'your-auth-token'
});
```

### Creating Stock Item

```typescript
const stockData = {
  itemName: 'Tomatoes',
  category: 'Vegetables',
  quantity: 50,
  unit: 'kg',
  costPerUnit: 3.50,
  minStock: 10,
  expiryDate: '2024-01-20T00:00:00Z',
  supplier: 'Fresh Farms Ltd'
};

const response = await makeApiCall('POST', '/api/kitchen/stock', {
  body: stockData,
  token: 'your-auth-token'
});
```

## ✅ Input Validation

The API includes comprehensive input validation:

```typescript
import { Validator } from './validation';

// Validate event data
const eventValidation = Validator.validateEvent(eventData);
if (!eventValidation.isValid) {
  console.error('Validation errors:', eventValidation.errors);
}

// Validate stock data
const stockValidation = Validator.validateStock(stockData);
```

## 🧪 Testing

### Running Tests

```typescript
import { ApiTester, testSuites } from './testing';

// Set authentication token
ApiTester.setAuthToken('your-test-token');

// Run all test suites
for (const suite of testSuites) {
  const results = await ApiTester.runTestSuite(suite);
  console.log(ApiTester.generateReport(results.results));
}
```

### Custom Test Cases

```typescript
import { TestCase, MockDataGenerator } from './testing';

const customTest: TestCase = {
  name: 'Create event with invalid data',
  method: 'POST',
  endpoint: '/api/kitchen/events',
  body: { name: '' }, // Invalid: missing required fields
  expectedStatus: 'error',
  description: 'Should return validation error'
};

const result = await ApiTester.runTest(customTest);
```

## 📚 Documentation Generation

### Generate HTML Documentation

```typescript
import { ApiDocGenerator } from './docs';

const htmlDocs = ApiDocGenerator.generateHtmlDocs();
// Save to file or serve via web server
```

### Generate Markdown Documentation

```typescript
const markdownDocs = ApiDocGenerator.generateMarkdownDocs();
// Save as README or documentation file
```

## 🔄 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## 🚨 Error Handling

Common error scenarios:

- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Resource not found
- **400 Bad Request**: Invalid input data or validation errors
- **500 Internal Server Error**: Server-side error

## 📈 Performance Considerations

- **Pagination**: Use `limit` and `offset` parameters for large datasets
- **Filtering**: Apply filters to reduce response size
- **Caching**: Implement caching for frequently accessed data
- **Rate Limiting**: Consider implementing rate limiting for production use

## 🔧 Configuration

### Environment Variables

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
```

### Database Setup

Ensure all required database tables are created using the migrations in `/kitchen/migrations/`.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests for new endpoints
3. Update documentation for API changes
4. Validate all inputs using the validation utilities
5. Follow the existing error handling patterns

## 📝 Changelog

### v1.0.0
- Initial API implementation
- Events, Stock, Cooking, and Indents endpoints
- Authentication and authorization
- Input validation and testing utilities
- Documentation generation

## 🆘 Support

For issues and questions:
- Check the test cases in `testing.ts` for usage examples
- Review the validation rules in `validation.ts`
- Generate and review the API documentation using `docs.ts`
- Ensure proper authentication and permissions are set

## 📄 License

This API is part of the Kitchen Module system and follows the same licensing terms as the main project.