# Database Setup Guide

## Quick Start

### 1. Environment Configuration

Copy the environment configuration file:

```bash
cp env.example .env
```

### 2. Start Database

```bash
# Start PostgreSQL database
npm run db:start

# Or use Docker Compose directly
docker-compose up -d db
```

### 3. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed
```

### 4. Start Application

```bash
npm run dev
```

## Database Management Commands

| Command                | Description        |
| ---------------------- | ------------------ |
| `npm run db:start`     | Start database     |
| `npm run db:stop`      | Stop database      |
| `npm run db:restart`   | Restart database   |
| `npm run db:logs`      | View database logs |
| `npm run db:studio`    | Open Prisma Studio |

## Database Connection Information

- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: app
- **Connection String**: `postgresql://postgres:postgres@localhost:5432/app`

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, you can modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432" # Use port 5433
```

Then update the `DATABASE_URL` in your `.env` file:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app"
```

### Database Connection Failed

1. Check if Docker is running
2. Check database container status: `docker-compose ps`
3. View database logs: `npm run db:logs`
4. Ensure firewall is not blocking port 5432

### Data Persistence

Database data is stored in Docker volume `pgdata`, so data won't be lost even if the container restarts.
If you need to reset data:

```bash
docker-compose down -v
docker-compose up -d db
```
