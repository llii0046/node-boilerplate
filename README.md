# Node.js TypeScript Boilerplate

A production-ready Node.js boilerplate with TypeScript, Express, Prisma ORM, and comprehensive development tooling.

## 🚀 Features

### Core Framework

- **TypeScript 5.5+** with strict configuration and ES modules
- **Express.js 4.19+** with middleware ecosystem
- **Prisma ORM** with PostgreSQL for type-safe database operations
- **Class-validator & Class-transformer** for request validation
- **Jest 30+** with comprehensive test coverage

### API Documentation

- **Custom Swagger Decorators** for in-code documentation
- **Automatic OpenAPI 3.0** specification generation
- **Interactive Swagger UI** at `/api/docs`
- **Decorator-based** route and parameter documentation

### Development Experience

- **Hot reload** with tsx for development
- **ESLint + Prettier** for code quality
- **Husky** for git hooks
- **TypeScript path mapping** with `@/` aliases

### Production Ready

- **Pino logging** with structured logging and multiple transports
- **Helmet.js** for security headers
- **CORS** configuration
- **Docker Compose** with PostgreSQL health checks
- **Error handling** with custom error classes
- **Pagination** system with configurable limits
- **Dependency injection** architecture

### Testing

- **Unit tests** with Jest and TypeScript
- **Integration tests** with Supertest
- **Test coverage** reporting
- **SQLite** for test database

## 📦 Quick Start

### Prerequisites

- Node.js 18.18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd node-boilerplate
npm install
```

2. **Set up environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start database**

```bash
npm run db:start
```

4. **Run database migrations**

```bash
npm run db:migrate
npm run db:seed
```

5. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:3000/api/docs` for API documentation.

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express app configuration
├── index.ts              # Application entry point
├── app.module.ts         # Main application module
├── modules/              # Feature modules
│   ├── user/            # User management
│   │   ├── dto/         # Data transfer objects
│   │   ├── tests/       # Unit and integration tests
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── health/          # Health check endpoints
│   └── shared/          # Shared services and utilities
│       ├── logger/      # Logging service
│       ├── prisma/      # Database service
│       ├── swagger/     # API documentation
│       └── shared.module.ts
├── shares/              # Shared DTOs and utilities
│   ├── dto/            # Common DTOs (pagination, timestamps)
│   └── error/          # Error handling classes
└── utils/              # Utility functions
```

## 🔧 Available Scripts

### Development

```bash
npm run dev              # Start development server with hot reload
npm run build            # TypeScript compilation check
npm run start            # Start production server
```

### Database

```bash
npm run db:start         # Start PostgreSQL with Docker
npm run db:stop          # Stop database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio
```

### Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Logging Configuration

```bash
npm run log:console      # Configure console-only logging
npm run log:file         # Configure file-only logging
npm run log:both         # Configure both console and file logging
```

## 📚 API Documentation

### Available Endpoints

#### Health Check

- `GET /api/health` - Service health status

#### User Management

- `GET /api/users` - List users with pagination
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Interactive Documentation

Visit `http://localhost:3000/api/docs` for interactive Swagger UI documentation.

## 🛠️ Customization

### Adding New Modules

1. Create a new module directory in `src/modules/`
2. Implement controller, service, and DTOs
3. Use decorators for API documentation
4. Add to `app.module.ts`

### Example Module Structure

```typescript
// Example: src/modules/product/
├── dto/
│   ├── create-product.dto.ts
│   └── product-response.dto.ts
├── product.controller.ts
├── product.service.ts
└── product.module.ts
```

### Using Decorators

```typescript
@ApiTags("Products")
export class ProductController extends ControllerBase {
  @Get()
  @ApiOperation({
    summary: "Get products",
    description: "Retrieve all products with pagination",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    type: "integer",
  })
  async getProducts(req: Request, res: Response) {
    // Implementation
  }
}
```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Input validation** with class-validator
- **Error handling** without exposing sensitive information

## 📊 Monitoring & Logging

### Logging Configuration

The project supports multiple logging modes:

- **Console**: Pretty-printed logs for development
- **File**: Structured logs for production
- **Both**: Console and file output

### Health Monitoring

- Database connection health checks
- Service uptime monitoring
- Structured error logging

## 🐳 Docker Support

### Development

```bash
docker-compose up -d db    # Start PostgreSQL
```

### Production

```bash
docker-compose up -d       # Start both app and database
```

## 🧪 Testing

### Running Tests

```bash
npm test                   # Run all tests
npm run test:watch         # Watch mode
```

### Test Structure

- **Unit tests**: `src/modules/*/tests/unit/`
- **Integration tests**: `src/modules/*/tests/integration/`
- **Test coverage**: Automatically generated

### Example Test

```typescript
describe("UserService", () => {
  it("should create user successfully", async () => {
    const userData = { email: "test@example.com", name: "Test User" };
    const result = await userService.createUser(userData);
    expect(result.email).toBe(userData.email);
  });
});
```

## 📈 Performance Features

- **Pino logging** (10x faster than Winston)
- **Connection pooling** with Prisma
- **Efficient validation** with class-validator
- **Optimized TypeScript** compilation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [CHANGELOG.md](CHANGELOG.md) for version history
- Review the [API documentation](http://localhost:3000/api/docs) when running locally
- Open an issue for bugs or feature requests

---

**Built with ❤️ using TypeScript, Express, and Prisma**
