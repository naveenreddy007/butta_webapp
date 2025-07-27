/**
 * API Documentation Generator
 * 
 * Generates comprehensive documentation for Kitchen Module API endpoints
 */
import { KitchenApiRouter } from './index';

export interface EndpointDoc {
  method: string;
  path: string;
  description: string;
  parameters?: ParameterDoc[];
  requestBody?: RequestBodyDoc;
  responses: ResponseDoc[];
  examples: ExampleDoc[];
  authentication: boolean;
  permissions?: string[];
}

export interface ParameterDoc {
  name: string;
  type: 'path' | 'query';
  dataType: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface RequestBodyDoc {
  contentType: string;
  schema: any;
  example: any;
}

export interface ResponseDoc {
  status: number;
  description: string;
  schema: any;
  example: any;
}

export interface ExampleDoc {
  title: string;
  description: string;
  request: any;
  response: any;
}

/**
 * API Documentation Generator
 */
export class ApiDocGenerator {
  /**
   * Generate complete API documentation
   */
  static generateDocs(): {
    info: any;
    endpoints: EndpointDoc[];
    schemas: any;
  } {
    return {
      info: this.getApiInfo(),
      endpoints: this.getEndpointDocs(),
      schemas: this.getSchemas()
    };
  }

  /**
   * Get API information
   */
  private static getApiInfo(): any {
    return {
      title: 'Kitchen Module API',
      version: '1.0.0',
      description: 'Comprehensive API for managing kitchen operations, events, stock, and cooking tasks',
      baseUrl: '/api/kitchen',
      authentication: {
        type: 'Bearer Token',
        description: 'All endpoints require authentication via Bearer token in Authorization header'
      },
      contact: {
        name: 'Kitchen Module Support',
        email: 'support@kitchen-module.com'
      }
    };
  }

  /**
   * Get endpoint documentation
   */
  private static getEndpointDocs(): EndpointDoc[] {
    return [
      // Events API
      {
        method: 'GET',
        path: '/api/kitchen/events',
        description: 'Retrieve all events with optional filtering',
        parameters: [
          { name: 'status', type: 'query', dataType: 'string', required: false, description: 'Filter by event status', example: 'PLANNED' },
          { name: 'date', type: 'query', dataType: 'string', required: false, description: 'Filter by event date', example: '2024-01-01' },
          { name: 'limit', type: 'query', dataType: 'number', required: false, description: 'Limit number of results', example: '10' },
          { name: 'offset', type: 'query', dataType: 'number', required: false, description: 'Offset for pagination', example: '0' }
        ],
        responses: [
          {
            status: 200,
            description: 'List of events retrieved successfully',
            schema: { type: 'array', items: { $ref: '#/schemas/Event' } },
            example: [
              {
                id: 'event-1',
                name: 'Wedding Reception',
                date: '2024-01-15T18:00:00Z',
                guestCount: 150,
                eventType: 'Wedding',
                status: 'PLANNED'
              }
            ]
          }
        ],
        examples: [
          {
            title: 'Get all events',
            description: 'Retrieve all events without filters',
            request: { method: 'GET', url: '/api/kitchen/events' },
            response: { success: true, data: [] }
          }
        ],
        authentication: true,
        permissions: ['ADMIN', 'KITCHEN_MANAGER', 'CHEF']
      },
      {
        method: 'POST',
        path: '/api/kitchen/events',
        description: 'Create a new event',
        requestBody: {
          contentType: 'application/json',
          schema: { $ref: '#/schemas/CreateEvent' },
          example: {
            name: 'Birthday Party',
            date: '2024-02-01T19:00:00Z',
            guestCount: 50,
            eventType: 'Birthday',
            assignedChef: 'chef-123'
          }
        },
        responses: [
          {
            status: 201,
            description: 'Event created successfully',
            schema: { $ref: '#/schemas/Event' },
            example: {
              id: 'event-123',
              name: 'Birthday Party',
              date: '2024-02-01T19:00:00Z',
              guestCount: 50,
              eventType: 'Birthday',
              status: 'PLANNED',
              createdAt: '2024-01-01T10:00:00Z'
            }
          }
        ],
        examples: [
          {
            title: 'Create wedding event',
            description: 'Create a new wedding event with 100 guests',
            request: {
              method: 'POST',
              url: '/api/kitchen/events',
              body: {
                name: 'Smith Wedding',
                date: '2024-06-15T18:00:00Z',
                guestCount: 100,
                eventType: 'Wedding'
              }
            },
            response: { success: true, data: { id: 'event-456', name: 'Smith Wedding' } }
          }
        ],
        authentication: true,
        permissions: ['ADMIN', 'KITCHEN_MANAGER']
      },

      // Stock API
      {
        method: 'GET',
        path: '/api/kitchen/stock',
        description: 'Retrieve all stock items with optional filtering',
        parameters: [
          { name: 'category', type: 'query', dataType: 'string', required: false, description: 'Filter by category', example: 'Vegetables' },
          { name: 'lowStock', type: 'query', dataType: 'boolean', required: false, description: 'Show only low stock items', example: 'true' },
          { name: 'expiring', type: 'query', dataType: 'boolean', required: false, description: 'Show only expiring items', example: 'true' },
          { name: 'search', type: 'query', dataType: 'string', required: false, description: 'Search by item name', example: 'tomato' }
        ],
        responses: [
          {
            status: 200,
            description: 'List of stock items retrieved successfully',
            schema: { type: 'array', items: { $ref: '#/schemas/Stock' } },
            example: [
              {
                id: 'stock-1',
                itemName: 'Tomatoes',
                category: 'Vegetables',
                quantity: 50,
                unit: 'kg',
                minStock: 10,
                expiryDate: '2024-01-20T00:00:00Z'
              }
            ]
          }
        ],
        examples: [
          {
            title: 'Get low stock items',
            description: 'Retrieve items that are below minimum stock level',
            request: { method: 'GET', url: '/api/kitchen/stock?lowStock=true' },
            response: { success: true, data: [] }
          }
        ],
        authentication: true,
        permissions: ['ADMIN', 'KITCHEN_MANAGER', 'CHEF']
      },
      {
        method: 'POST',
        path: '/api/kitchen/stock',
        description: 'Create a new stock item',
        requestBody: {
          contentType: 'application/json',
          schema: { $ref: '#/schemas/CreateStock' },
          example: {
            itemName: 'Onions',
            category: 'Vegetables',
            quantity: 25,
            unit: 'kg',
            costPerUnit: 2.50,
            minStock: 5,
            supplier: 'Fresh Farms Ltd'
          }
        },
        responses: [
          {
            status: 201,
            description: 'Stock item created successfully',
            schema: { $ref: '#/schemas/Stock' },
            example: {
              id: 'stock-123',
              itemName: 'Onions',
              category: 'Vegetables',
              quantity: 25,
              unit: 'kg',
              isActive: true,
              createdAt: '2024-01-01T10:00:00Z'
            }
          }
        ],
        examples: [
          {
            title: 'Add new vegetable stock',
            description: 'Add a new vegetable item to stock inventory',
            request: {
              method: 'POST',
              url: '/api/kitchen/stock',
              body: {
                itemName: 'Carrots',
                category: 'Vegetables',
                quantity: 30,
                unit: 'kg'
              }
            },
            response: { success: true, data: { id: 'stock-789', itemName: 'Carrots' } }
          }
        ],
        authentication: true,
        permissions: ['ADMIN', 'KITCHEN_MANAGER']
      },

      // Cooking API
      {
        method: 'GET',
        path: '/api/kitchen/cooking/board/:eventId',
        description: 'Get cooking board data for a specific event (Kanban view)',
        parameters: [
          { name: 'eventId', type: 'path', dataType: 'string', required: true, description: 'Event ID', example: 'event-123' }
        ],
        responses: [
          {
            status: 200,
            description: 'Cooking board data retrieved successfully',
            schema: { $ref: '#/schemas/CookingBoard' },
            example: {
              eventId: 'event-123',
              board: {
                NOT_STARTED: [],
                IN_PROGRESS: [],
                COMPLETED: [],
                ON_HOLD: []
              },
              stats: {
                total: 10,
                completed: 3,
                inProgress: 4,
                notStarted: 2,
                onHold: 1,
                completionPercentage: 30
              }
            }
          }
        ],
        examples: [
          {
            title: 'Get cooking board for wedding',
            description: 'Retrieve cooking tasks organized by status for a wedding event',
            request: { method: 'GET', url: '/api/kitchen/cooking/board/wedding-123' },
            response: { success: true, data: { eventId: 'wedding-123', board: {} } }
          }
        ],
        authentication: true,
        permissions: ['ADMIN', 'KITCHEN_MANAGER', 'CHEF']
      }
    ];
  }

  /**
   * Get data schemas
   */
  private static getSchemas(): any {
    return {
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique event identifier' },
          name: { type: 'string', description: 'Event name' },
          date: { type: 'string', format: 'date-time', description: 'Event date and time' },
          guestCount: { type: 'number', description: 'Number of guests' },
          eventType: { type: 'string', description: 'Type of event' },
          status: { type: 'string', enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          assignedChef: { type: 'string', description: 'ID of assigned chef' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateEvent: {
        type: 'object',
        required: ['name', 'date', 'guestCount', 'eventType'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          date: { type: 'string', format: 'date-time' },
          guestCount: { type: 'number', minimum: 1, maximum: 1000 },
          eventType: { type: 'string', minLength: 1, maxLength: 50 },
          assignedChef: { type: 'string' }
        }
      },
      Stock: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique stock item identifier' },
          itemName: { type: 'string', description: 'Name of the stock item' },
          category: { type: 'string', description: 'Item category' },
          quantity: { type: 'number', description: 'Current quantity' },
          unit: { type: 'string', description: 'Unit of measurement' },
          expiryDate: { type: 'string', format: 'date-time', description: 'Expiry date' },
          batchNumber: { type: 'string', description: 'Batch number' },
          supplier: { type: 'string', description: 'Supplier name' },
          costPerUnit: { type: 'number', description: 'Cost per unit' },
          isActive: { type: 'boolean', description: 'Whether item is active' },
          minStock: { type: 'number', description: 'Minimum stock level' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateStock: {
        type: 'object',
        required: ['itemName', 'category', 'quantity', 'unit'],
        properties: {
          itemName: { type: 'string', minLength: 1, maxLength: 100 },
          category: { type: 'string', minLength: 1, maxLength: 50 },
          quantity: { type: 'number', minimum: 0 },
          unit: { type: 'string', minLength: 1, maxLength: 20 },
          expiryDate: { type: 'string', format: 'date-time' },
          batchNumber: { type: 'string', maxLength: 50 },
          supplier: { type: 'string', maxLength: 100 },
          costPerUnit: { type: 'number', minimum: 0 },
          minStock: { type: 'number', minimum: 0 }
        }
      },
      CookingBoard: {
        type: 'object',
        properties: {
          eventId: { type: 'string' },
          board: {
            type: 'object',
            properties: {
              NOT_STARTED: { type: 'array', items: { $ref: '#/schemas/CookingLog' } },
              IN_PROGRESS: { type: 'array', items: { $ref: '#/schemas/CookingLog' } },
              COMPLETED: { type: 'array', items: { $ref: '#/schemas/CookingLog' } },
              ON_HOLD: { type: 'array', items: { $ref: '#/schemas/CookingLog' } }
            }
          },
          stats: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              completed: { type: 'number' },
              inProgress: { type: 'number' },
              notStarted: { type: 'number' },
              onHold: { type: 'number' },
              completionPercentage: { type: 'number' }
            }
          }
        }
      },
      CookingLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          eventId: { type: 'string' },
          dishName: { type: 'string' },
          category: { type: 'string' },
          servings: { type: 'number' },
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'] },
          assignedTo: { type: 'string' },
          priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
          estimatedTime: { type: 'number' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    };
  }

  /**
   * Generate HTML documentation
   */
  static generateHtmlDocs(): string {
    const docs = this.generateDocs();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docs.info.title} Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .endpoint { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #3498db; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 3px; color: white; font-weight: bold; margin-right: 10px; }
        .get { background: #27ae60; }
        .post { background: #f39c12; }
        .put { background: #8e44ad; }
        .delete { background: #e74c3c; }
        .patch { background: #16a085; }
        .path { font-family: monospace; background: #ecf0f1; padding: 2px 6px; border-radius: 3px; }
        .parameter { background: #fff; padding: 10px; margin: 5px 0; border-radius: 3px; border: 1px solid #ddd; }
        .required { color: #e74c3c; font-weight: bold; }
        .optional { color: #95a5a6; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .auth-required { background: #e8f5e8; color: #27ae60; padding: 4px 8px; border-radius: 3px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${docs.info.title}</h1>
        <p><strong>Version:</strong> ${docs.info.version}</p>
        <p><strong>Base URL:</strong> <code>${docs.info.baseUrl}</code></p>
        <p>${docs.info.description}</p>
        
        <h2>Authentication</h2>
        <p><strong>Type:</strong> ${docs.info.authentication.type}</p>
        <p>${docs.info.authentication.description}</p>
        
        <h2>Endpoints</h2>
        ${docs.endpoints.map(endpoint => `
            <div class="endpoint">
                <h3>
                    <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                    <span class="path">${endpoint.path}</span>
                    ${endpoint.authentication ? '<span class="auth-required">🔒 Auth Required</span>' : ''}
                </h3>
                <p>${endpoint.description}</p>
                
                ${endpoint.parameters && endpoint.parameters.length > 0 ? `
                    <h4>Parameters</h4>
                    ${endpoint.parameters.map(param => `
                        <div class="parameter">
                            <strong>${param.name}</strong> 
                            <span class="${param.required ? 'required' : 'optional'}">(${param.required ? 'required' : 'optional'})</span>
                            <br>
                            <em>Type:</em> ${param.dataType} | <em>Location:</em> ${param.type}
                            <br>
                            ${param.description}
                            ${param.example ? `<br><em>Example:</em> <code>${param.example}</code>` : ''}
                        </div>
                    `).join('')}
                ` : ''}
                
                ${endpoint.requestBody ? `
                    <h4>Request Body</h4>
                    <p><strong>Content-Type:</strong> ${endpoint.requestBody.contentType}</p>
                    <pre>${JSON.stringify(endpoint.requestBody.example, null, 2)}</pre>
                ` : ''}
                
                <h4>Responses</h4>
                ${endpoint.responses.map(response => `
                    <div class="parameter">
                        <strong>Status ${response.status}:</strong> ${response.description}
                        <pre>${JSON.stringify(response.example, null, 2)}</pre>
                    </div>
                `).join('')}
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate Markdown documentation
   */
  static generateMarkdownDocs(): string {
    const docs = this.generateDocs();
    
    let markdown = `# ${docs.info.title}\n\n`;
    markdown += `**Version:** ${docs.info.version}\n`;
    markdown += `**Base URL:** \`${docs.info.baseUrl}\`\n\n`;
    markdown += `${docs.info.description}\n\n`;
    
    markdown += `## Authentication\n\n`;
    markdown += `**Type:** ${docs.info.authentication.type}\n\n`;
    markdown += `${docs.info.authentication.description}\n\n`;
    
    markdown += `## Endpoints\n\n`;
    
    docs.endpoints.forEach(endpoint => {
      markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
      markdown += `${endpoint.description}\n\n`;
      
      if (endpoint.authentication) {
        markdown += `🔒 **Authentication Required**\n\n`;
      }
      
      if (endpoint.parameters && endpoint.parameters.length > 0) {
        markdown += `#### Parameters\n\n`;
        markdown += `| Name | Type | Required | Description | Example |\n`;
        markdown += `|------|------|----------|-------------|----------|\n`;
        endpoint.parameters.forEach(param => {
          markdown += `| ${param.name} | ${param.dataType} (${param.type}) | ${param.required ? '✅' : '❌'} | ${param.description} | ${param.example || '-'} |\n`;
        });
        markdown += `\n`;
      }
      
      if (endpoint.requestBody) {
        markdown += `#### Request Body\n\n`;
        markdown += `**Content-Type:** ${endpoint.requestBody.contentType}\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example, null, 2)}\n\`\`\`\n\n`;
      }
      
      markdown += `#### Responses\n\n`;
      endpoint.responses.forEach(response => {
        markdown += `**${response.status}** - ${response.description}\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n\n`;
      });
      
      markdown += `---\n\n`;
    });
    
    return markdown;
  }
}