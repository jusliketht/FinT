# FinT Application - Deployment & Testing Guide

## PHASE 15: TESTING SETUP

### Backend Testing Setup

#### Install Testing Dependencies
```bash
cd fint-backend
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D @nestjs/testing
```

#### Create jest.config.js
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

#### Create test/app.e2e-spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

#### Create src/auth/auth.service.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@/database/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isEmailVerified: false,
        createdAt: new Date(),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.message).toBe('Registration successful. Please verify your email.');
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        businessUsers: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBe('jwt-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

### Frontend Testing Setup

#### Install Testing Dependencies
```bash
cd fint-frontend
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jest-environment-jsdom
```

#### Create src/setupTests.ts
```typescript
import '@testing-library/jest-dom';
```

#### Create src/components/common/__tests__/Button.test.tsx
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Button } from '../Button';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('Button Component', () => {
  it('renders button with text', () => {
    renderWithChakra(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    renderWithChakra(<Button>Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('chakra-button');
  });

  it('applies secondary variant when specified', () => {
    renderWithChakra(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
```

## PHASE 16: DOCKER SETUP

### Backend Dockerfile

#### Create fint-backend/Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### Create fint-backend/healthcheck.js
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

request.end();
```

#### Create fint-backend/.dockerignore
```
node_modules
npm-debug.log
dist
coverage
.env
.git
.gitignore
README.md
Dockerfile
.dockerignore
```

### Frontend Dockerfile

#### Create fint-frontend/Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Create fint-frontend/nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen       80;
        server_name  localhost;
        root         /usr/share/nginx/html;
        index        index.html index.htm;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (if needed)
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Docker Compose Setup

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: fint-postgres
    environment:
      POSTGRES_DB: fint_db
      POSTGRES_USER: fint_user
      POSTGRES_PASSWORD: fint_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    networks:
      - fint-network
    restart: unless-stopped

  # Redis (for caching and sessions)
  redis:
    image: redis:7-alpine
    container_name: fint-redis
    ports:
      - "6379:6379"
    networks:
      - fint-network
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: ./fint-backend
      dockerfile: Dockerfile
    container_name: fint-backend
    environment:
      DATABASE_URL: postgresql://fint_user:fint_password@postgres:5432/fint_db
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      JWT_EXPIRES_IN: 7d
      NODE_ENV: production
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - fint-network
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./fint-frontend
      dockerfile: Dockerfile
    container_name: fint-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - fint-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  fint-network:
    driver: bridge
```

#### Create docker-compose.dev.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fint-postgres-dev
    environment:
      POSTGRES_DB: fint_db_dev
      POSTGRES_USER: fint_user
      POSTGRES_PASSWORD: fint_password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - fint-dev-network

  redis:
    image: redis:7-alpine
    container_name: fint-redis-dev
    ports:
      - "6379:6379"
    networks:
      - fint-dev-network

  backend:
    build:
      context: ./fint-backend
      dockerfile: Dockerfile.dev
    container_name: fint-backend-dev
    environment:
      DATABASE_URL: postgresql://fint_user:fint_password@postgres:5432/fint_db_dev
      JWT_SECRET: dev-jwt-secret
      NODE_ENV: development
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - fint-dev-network
    volumes:
      - ./fint-backend:/app
      - /app/node_modules
      - ./uploads:/app/uploads
    command: npm run start:dev

  frontend:
    build:
      context: ./fint-frontend
      dockerfile: Dockerfile.dev
    container_name: fint-frontend-dev
    environment:
      REACT_APP_API_URL: http://localhost:3000/api/v1
    ports:
      - "3001:3000"
    depends_on:
      - backend
    networks:
      - fint-dev-network
    volumes:
      - ./fint-frontend:/app
      - /app/node_modules
    command: npm start

volumes:
  postgres_dev_data:

networks:
  fint-dev-network:
    driver: bridge
```

## PHASE 17: DEPLOYMENT SCRIPTS

### Create deployment scripts

#### Create scripts/deploy.sh
```bash
#!/bin/bash

set -e

echo "🚀 Starting FinT Application Deployment"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
mkdir -p uploads
mkdir -p logs

# Set proper permissions
chmod 755 uploads
chmod 755 logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Created .env file from .env.example"
        echo "⚠️  Please update the .env file with your configuration"
    else
        echo "❌ No .env.example file found. Please create a .env file manually."
        exit 1
    fi
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo "🗄️  Starting database..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose run --rm backend npx prisma migrate deploy

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Check if services are running
echo "🔍 Checking service status..."
sleep 5

if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Frontend: http://localhost"
    echo "🔗 Backend API: http://localhost:3000"
    echo "📊 Database: localhost:5432"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Update services: ./scripts/update.sh"
```

#### Create scripts/update.sh
```bash
#!/bin/bash

set -e

echo "🔄 Updating FinT Application"

# Pull latest changes
git pull origin main

# Rebuild and restart services
echo "🔨 Rebuilding services..."
docker-compose build --no-cache

echo "🔄 Running database migrations..."
docker-compose run --rm backend npx prisma migrate deploy

echo "🚀 Restarting services..."
docker-compose up -d

echo "✅ Update completed succe
(Content truncated due to size limit. Use line ranges to read in chunks)