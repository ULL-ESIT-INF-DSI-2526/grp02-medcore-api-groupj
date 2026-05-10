# MedCore API

[![CI Tests](https://github.com/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-groupj/actions/workflows/ci.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-groupj/actions/workflows/ci.yml)

[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-groupj/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-groupj?branch=main)

API REST para la gestión de un hospital de tamaño mediano, implementada con Node.js, Express y MongoDB. Permite gestionar pacientes, personal médico, medicamentos y registros médicos (consultas e ingresos).

---

## Contenido

- [Tecnologías](#tecnologías)
- [Clonar el proyecto](#clonar-el-proyecto)
- [Instalar dependencias](#instalar-dependencias)
- [Variables de entorno](#variables-de-entorno)
- [MongoDB](#mongodb)
- [Ejecutar la aplicación](#ejecutar-la-aplicación)
- [Swagger / Documentación](#swagger--documentación)
- [Tests](#tests)
- [Despliegue](#despliegue)
- [Endpoints principales](#endpoints-principales)

---

## Tecnologías

- Node.js
- Express 5
- TypeScript
- MongoDB / Mongoose
- Swagger (OpenAPI)
- Vitest (tests)
- Render (despliegue)

---

## Clonar el proyecto

```bash
git clone git@github.com:ULL-ESIT-INF-DSI-2526/grp02-medcore-api-groupj.git
cd grp02-medcore-api-groupj
```

---

## Instalar dependencias

```bash
npm install
```

---

## Variables de entorno

El proyecto utiliza archivos de configuración dentro de la carpeta `config/`.

### Desarrollo

Archivo: `config/dev.env`

```env
MONGODB_URL=mongodb://127.0.0.1:27017/medcore-local
PORT=3000
```

### Testing

Archivo: `config/test.env`

```env
MONGODB_URL=mongodb://127.0.0.1:27017/medcore-local-test
PORT=3000
```

> La separación entre bases de datos evita que los tests modifiquen los datos de desarrollo.

---

## MongoDB

Es necesario tener MongoDB ejecutándose localmente antes de iniciar la aplicación o lanzar los tests.

### Iniciar MongoDB (Linux)

```bash
sudo systemctl start mongod
```

---

## Ejecutar la aplicación

### Compilar TypeScript

```bash
npm run build
```

### Ejecutar en modo producción

```bash
npm start
```

### Ejecutar en modo desarrollo (con watch y variables de entorno)

```bash
npm run dev
```

---

## Despliegue en Render

### Base URL del API

```txt
https://medcore-d8kv.onrender.com
```

### Swagger/OpenAPI

https://medcore-d8kv.onrender.com/api-docs

### Ejemplo de endpoint funcional

https://medcore-d8kv.onrender.com/staff

---

## Tests

Ejecutar los tests con Vitest:

```bash
npm test
```

Generar cobertura:

```bash
npm run coverage
```

---

## Endpoints principales

### Pacientes

| Método | Ruta |
|---|---|
| POST | `/patients` |
| GET | `/patients` |
| GET | `/patients/:id` |
| PATCH | `/patients` |
| PATCH | `/patients/:id` |
| DELETE | `/patients` |
| DELETE | `/patients/:id` |

---

### Personal sanitario

| Método | Ruta |
|---|---|
| POST | `/staff` |
| GET | `/staff` |
| GET | `/staff/:id` |
| PATCH | `/staff` |
| PATCH | `/staff/:id` |
| DELETE | `/staff` |
| DELETE | `/staff/:id` |

---

### Medicamentos

| Método | Ruta |
|---|---|
| POST | `/medications` |
| GET | `/medications` |
| GET | `/medications/:id` |
| PATCH | `/medications` |
| PATCH | `/medications/:id` |
| DELETE | `/medications` |
| DELETE | `/medications/:id` |

---

### Registros clínicos

| Método | Ruta |
|---|---|
| POST | `/records` |
| GET | `/records` |
| GET | `/records/patient` |
| GET | `/records/:id` |
| PATCH | `/records/:id` |
| DELETE | `/records/:id` |

---

> Los detalles completos de parámetros, cuerpos de petición y respuestas pueden consultarse en Swagger.

---

## Notas

- Todos los endpoints devuelven JSON.  
- La lógica de negocio incluye validaciones estrictas sobre disponibilidad de stock, existencia de pacientes y médicos, y fechas de caducidad de medicamentos. 
