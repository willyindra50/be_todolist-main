import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { todosRouter } from './routes/todos';

type SwaggerRequest = {
  headers: Record<string, string>;
  method?: string;
  url?: string;
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Web Programming Hack - Todo API',
      version: '1.0.0',
      description: 'API documentation for managing todos',
    },
    tags: [
      {
        name: 'Todos',
        description: 'Operations related to todo items',
      },
    ],
    components: {
      schemas: {
        Todo: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'The unique ID of the todo' },
            title: { type: 'string', description: 'The title of the todo' },
            completed: {
              type: 'boolean',
              description: 'Whether the todo is completed',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'The date associated with the todo',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              description: 'The priority of the todo',
            },
          },
          required: ['id', 'title', 'completed', 'date', 'priority'],
        },
        NewTodo: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'The title of the todo' },
            completed: {
              type: 'boolean',
              default: false,
              description: 'Whether the todo is completed',
            },
            date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Optional due date',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              default: 'MEDIUM',
              description: 'Priority level of the todo',
            },
          },
          required: ['title'],
        },
      },
    },
  },
  apis: ['./src/routes/todos/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/swagger-ui.css',
  express.static(path.join(__dirname, 'css/swagger-ui.css'))
);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCssUrl: '/swagger-ui.css',
    customSiteTitle: 'Todo API Documentation',
    swaggerOptions: {
      requestInterceptor: (req: SwaggerRequest) => {
        console.log('Intercepting request:', req);
        req.headers['api-key'] = '0ICVyrNhPL56Oss58qv-_y42PhSQvYcPm6Vz26j4bNw';
        return req;
      },
    },
  })
);

app.use('/todos', todosRouter);

// ✅ Default route biar "/" gak kosong
app.get('/', (req, res) => {
  res.send('✅ Todo API is running! Cek /api-docs untuk dokumentasi.');
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
  console.log('Swagger docs available at http://localhost:8080/api-docs');
});
