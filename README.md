## 📝 README.md para GitHub

```markdown
# 🚀 NexusCore-API

**API REST con arquitectura hexagonal, autenticación JWT, control de roles y documentación Swagger**

![Node.js](https://img.shields.io/badge/Node.js-22.12.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue)
![Express](https://img.shields.io/badge/Express-5.2.1-black)
![Prisma](https://img.shields.io/badge/Prisma-7.9.0-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Swagger](https://img.shields.io/badge/Swagger-Documentation-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Jest](https://img.shields.io/badge/Jest-Testing-red)
![Coverage](https://img.shields.io/badge/Coverage-87%25-brightgreen)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Características](#-características)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Endpoints](#-endpoints)
- [Docker](#-docker)
- [Pruebas](#-pruebas)
- [Base de Datos](#-base-de-datos)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 📖 Descripción

**NexusCore-API** es una API REST moderna construida con **Arquitectura Hexagonal** (Puertos y Adaptadores) que proporciona:

- 🔐 **Autenticación JWT** (Register, Login, Refresh Token, Logout)
- 👥 **CRUD completo de usuarios** (Crear, Leer, Actualizar, Eliminar)
- 🎯 **Control de roles** (ADMIN, EDITOR, VIEWER, USER)
- 📚 **Documentación Swagger/OpenAPI** interactiva
- 🧪 **Pruebas exhaustivas** (Unitarias, Integración y E2E)
- 🐳 **Dockerizado** para fácil despliegue

Desarrollada con **TDD (Test-Driven Development)** y siguiendo las mejores prácticas de **Clean Code** y **Domain-Driven Design**.

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | v22.12.0 | Runtime |
| TypeScript | v6.0.3 | Tipado estático |
| Express | v5.2.1 | Framework web |
| Prisma | v7.9.0 | ORM |
| PostgreSQL | 16 | Base de datos |

### Seguridad
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| JWT | v9.0.3 | Autenticación |
| bcrypt | v6.0.0 | Hashing de contraseñas |
| helmet | v8.3.0 | Seguridad HTTP |
| cors | v2.8.6 | CORS |

### Documentación y Validación
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Swagger | v6.3.0 | Documentación API |
| Zod | v4.4.3 | Validaciones |

### Pruebas
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Jest | v30.4.2 | Framework de pruebas |
| Supertest | v7.2.2 | Pruebas E2E |

### DevOps
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Docker | Última | Contenedores |
| Docker Compose | Última | Orquestación |

---

## 🏗️ Arquitectura

### Arquitectura Hexagonal (Puertos y Adaptadores)

```
┌─────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Entities  │  Value Objects  │  Enums  │  Repository │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  Use Cases  │  DTOs  │  Errors  │           │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Repositories  │  Controllers  │  Middlewares │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                      HTTP LAYER                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Routes  │  Express  │  Swagger             │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- ✅ Registro de usuarios con validación
- ✅ Login con JWT
- ✅ Refresh Token para renovar sesión
- ✅ Logout
- ✅ Protección de contraseñas con bcrypt
- ✅ Middleware de autenticación

### 👥 Gestión de Usuarios
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Soft delete (eliminación lógica)
- ✅ Perfil de usuario
- ✅ Listado de usuarios (solo ADMIN)

### 🎯 Roles y Permisos
- ✅ **ADMIN**: Acceso completo
- ✅ **EDITOR**: Acceso limitado
- ✅ **VIEWER**: Solo lectura
- ✅ **USER**: Acceso básico

### 📚 Documentación
- ✅ Swagger UI interactiva
- ✅ OpenAPI 3.0
- ✅ Prueba de endpoints desde la UI

### 🧪 Pruebas
- ✅ 87+ pruebas pasando
- ✅ Cobertura: ~87%
- ✅ Pruebas unitarias
- ✅ Pruebas de integración
- ✅ Pruebas E2E

### 🐳 DevOps
- ✅ Dockerfile optimizado
- ✅ Docker Compose para desarrollo y producción
- ✅ Variables de entorno configuradas
- ✅ Health checks

---

## 📦 Instalación

### Requisitos Previos

- Node.js v22+
- Docker (opcional)
- PostgreSQL 16 (o usar Docker)

### Clonar el repositorio

```bash
git clone https://github.com/Sebast27/NexusCore-API.git
cd NexusCore-API
```

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Base de datos
DATABASE_URL=""

# JWT
JWT_SECRET=""
JWT_ACCESS_EXPIRATION=""
JWT_REFRESH_EXPIRATION=""

# Servidor
PORT=
NODE_ENV=""
```

### Configurar base de datos

```bash
# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Sembrar datos (usuarios de prueba)
npm run prisma:seed
```

---

## 🚀 Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

### Docker

```bash
# Desarrollo
docker-compose up -d

# Producción
npm run docker:build
npm run docker:up
```

---

## 📚 Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar usuario | ✅ |
| POST | `/login` | Iniciar sesión | ✅ |
| POST | `/refresh` | Renovar token | ✅ |
| POST | `/logout` | Cerrar sesión | ✅ |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/profile` | Perfil propio | ✅ | USER+ |
| GET | `/users` | Listar usuarios | ✅ | ADMIN |
| PUT | `/:id` | Actualizar usuario | ✅ | ADMIN |
| DELETE | `/:id` | Eliminar usuario | ✅ | ADMIN |

### Documentación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api-docs` | Swagger UI |
| GET | `/health` | Health check |

---

### Ejemplos de Uso

#### Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@test.com",
    "name": "Test User",
    "role": "USER",
    "createdAt": "2026-07-28T17:25:20.974Z",
    "updatedAt": "2026-07-28T17:25:20.974Z"
  }
}
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!@#"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@test.com",
    "name": "Test User",
    "role": "USER",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Obtener perfil (protegido)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🐳 Docker

### Comandos Docker

```bash
# Construir imagen de producción
npm run docker:build

# Levantar contenedores
npm run docker:up

# Ver logs
npm run docker:logs

# Reiniciar contenedores
npm run docker:restart

# Detener contenedores
npm run docker:down

# Limpiar todo
npm run docker:clean
```

### Servicios Docker

| Servicio | Puerto | URL |
|----------|--------|-----|
| API | 3000 | http://localhost:3000 |
| Swagger | 3000 | http://localhost:3000/api-docs |
| PostgreSQL | 5432 | localhost:5432 |
| PgAdmin | 5050 | http://localhost:5050 |

---

## 🧪 Pruebas

### Ejecutar pruebas

```bash
# Todas las pruebas
npm test

# Pruebas unitarias
npm run test:unit

# Pruebas de integración
npm run test:integration

# Pruebas con watch
npm run test:watch

# Reporte de cobertura
npm run test:coverage
```

### Cobertura de pruebas

| Capa | Cobertura | Estado |
|------|-----------|--------|
| **Domain** | 100% | ✅ |
| **Application** | 100% | ✅ |
| **Infrastructure** | ~86% | ✅ |
| **E2E** | 12/12 | ✅ |
| **Total** | ~87% | ✅ |

---

## 📊 Base de Datos

### Esquema Prisma

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}
```

### Usuarios de Prueba (Seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@nexuscore.com | Admin123! | ADMIN |
| editor@nexuscore.com | Editor123! | EDITOR |
| viewer@nexuscore.com | Viewer123! | VIEWER |

### Comandos Prisma

```bash
# Generar Prisma Client
npm run prisma:generate

# Crear migración
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Sembrar datos
npm run prisma:seed
```

---

## 📚 Documentación

### Swagger UI

La documentación interactiva está disponible en:

```
http://localhost:3000/api-docs
```

![Swagger UI](https://swagger.io/swagger/media/swagger_logo.svg)

### Health Check

```
http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2026-07-28T17:25:20.974Z",
  "service": "NexusCore-API"
}
```

---

## 📁 Estructura del Proyecto

```
NexusCore-API/
├── src/
│   ├── domain/                    # Domain Layer
│   │   ├── entities/              # Entidades
│   │   ├── enums/                 # Enums
│   │   ├── interfaces/            # Interfaces de repositorios
│   │   └── value-objects/         # Value Objects
│   ├── application/               # Application Layer
│   │   ├── dtos/                  # Data Transfer Objects
│   │   ├── errors/                # Errores personalizados
│   │   └── use-cases/             # Casos de uso
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── adapters/              # Adaptadores
│   │   │   ├── database/          # Repositorios
│   │   │   └── http/              # HTTP (controllers, middlewares, routes)
│   │   └── config/                # Configuraciones
│   └── server.ts                  # Punto de entrada
├── prisma/
│   ├── schema.prisma              # Esquema de base de datos
│   ├── seed.ts                    # Seed de datos
│   └── migrations/                # Migraciones
├── tests/
│   ├── unit/                      # Pruebas unitarias
│   ├── integration/               # Pruebas de integración
│   └── setup.ts                   # Configuración de pruebas
├── .env                           # Variables de entorno
├── .dockerignore                  # Ignorar archivos en Docker
├── .gitignore                     # Ignorar archivos en Git
├── Dockerfile                     # Dockerfile para producción
├── docker-compose.yml             # Docker Compose para desarrollo
├── docker-compose.prod.yml        # Docker Compose para producción
├── jest.config.js                 # Configuración de Jest
├── prisma.config.ts               # Configuración de Prisma
├── tsconfig.json                  # Configuración de TypeScript
├── package.json                   # Dependencias y scripts
└── README.md                      # Este archivo
```

---

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crear** rama de feature (`git checkout -b feature/nueva-feature`)
3. **Commit** los cambios (`git commit -m "feat: agregar nueva feature"`)
4. **Push** a la rama (`git push origin feature/nueva-feature`)
5. **Abrir** Pull Request

### Convenciones de commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de errores
- `docs:` Documentación
- `test:` Pruebas
- `refactor:` Refactorización
- `chore:` Mantenimiento

---

## 📄 Licencia

MIT © [Sebastian Diaz](https://github.com/Sebast27)

---

## 🔗 Enlaces

- **GitHub:** https://github.com/Sebast27/NexusCore-API
- **Issues:** https://github.com/Sebast27/NexusCore-API/issues
- **Documentación:** http://localhost:3000/api-docs

---

## ✨ ¡Proyecto Completado!

```
✅ Arquitectura Hexagonal
✅ Autenticación JWT (Register, Login, Refresh, Logout)
✅ CRUD de usuarios
✅ Roles (ADMIN, EDITOR, VIEWER, USER)
✅ Middlewares (Auth, Roles)
✅ Pruebas (Unitarias, Integración, E2E)
✅ Documentación Swagger
✅ Docker y Docker Compose
✅ CI/CD Ready
✅ 87+ pruebas pasando
✅ ~87% cobertura
```