# Sumar Impacto - Plataforma de Gestion de Donaciones Comunitarias
## Desarrollo de Software Web - Backend | 2° Parcial (TP2)
### IFTS N° 29 - Segundo Cuatrimestre 2026

**Equipo de Desarrollo:** Grupo 15 - pITzza & BirrAPI  
**Integrantes:**
- Sonia Raquel Andrada
- Guillermo Alberto Chacon
- Eitel Hugo Belinzoni
- Emilia Sosa

---

## 1. Descripcion del Proyecto
Sumar Impacto es una plataforma backend desarrollada con **Node.js**, **Express** y persistencia no relacional en **MongoDB** a traves del ODM **Mongoose**. Su proposito es conectar organizaciones comunitarias con donantes, gestionando causas solidarias, recaudaciones en tiempo real y registro trazable de aportes monetarios.

Para esta segunda entrega (TP2), se migro la persistencia en memoria (Arrays/JSON del TP1) a una base de datos documental MongoDB, implementando una arquitectura modular por capas (Modelos, Controladores, Rutas y Vistas), validaciones en middlewares y metodos de instancia en los esquemas de Mongoose.

---

## 2. Tecnologias Utilizadas
- **Node.js**: Entorno de ejecucion backend (ES Modules - `type: "module"`).
- **Express.js**: Framework web para la creacion de APIs REST y enrutamiento modular.
- **MongoDB**: Base de datos NoSQL orientada a documentos (Community Server 9.0).
- **Mongoose**: Modelado de objetos y esquemas documentales (ODM).
- **Pug**: Motor de plantillas del lado del servidor (SSR) para la interfaz web.
- **dotenv**: Manejo seguro de variables de entorno de configuracion.

---

## 3. Estructura del Proyecto
```
TP2/
│-- config/
│   └── db.js                 # Conexion asincronica a MongoDB con Mongoose
│-- controllers/
│   ├── donacionesController.js # Logica de donaciones, validacion de fondos y populate
│   ├── personasController.js   # CRUD de personas (donantes y responsables)
│   ├── proyectosController.js  # CRUD de proyectos y filtros por categoria
│   └── webController.js        # Logica y renderizado de vistas Pug
│-- middlewares/
│   └── validarCampos.js      # Middlewares de validacion sintactica y semantica
│-- models/
│   ├── Donacion.js           # Esquema de donaciones con referencias ObjectId
│   ├── Persona.js            # Esquema de personas con tipos y timestamps
│   └── Proyecto.js           # Esquema con metodos de instancia de negocio
│-- public/
│   └── styles.css            # Estilos CSS de la interfaz web
│-- routes/
│   ├── donacionesRoutes.js   # Rutas de la API REST para donaciones
│   ├── personasRoutes.js     # Rutas de la API REST para personas
│   ├── proyectosRoutes.js    # Rutas de la API REST para proyectos
│   └── webRoutes.js          # Rutas de la aplicacion web (vistas)
│-- views/
│   ├── layout.pug            # Plantilla base y navegacion
│   ├── index.pug             # Pagina principal con proyectos y panel
│   ├── proyectos.pug         # Listado y detalle de proyectos activos
│   └── nueva-donacion.pug    # Formulario web de registro de donacion
│-- .env                      # Variables de entorno locales
│-- .env.example              # Plantilla de configuracion de variables de entorno
│-- .gitignore                # Exclusion de node_modules y entornos
│-- index.js                  # Punto de entrada principal y montaje del servidor Express
│-- package.json              # Configuracion de dependencias y scripts npm
│-- README.md                 # Documentacion tecnica del proyecto
└── seed.js                   # Script para carga inicial de datos de prueba en MongoDB
```

---

## 4. Requisitos Previos e Instalacion

### Requisitos
- Node.js version 18.x o superior.
- MongoDB Community Server en ejecucion en el puerto 27017 (o una URI remota de MongoDB Atlas).

### Instalacion de Dependencias
```bash
npm install
```

### Configuracion de Variables de Entorno
Cree un archivo `.env` en la raiz del proyecto con el siguiente contenido:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/sumar_impacto
```

### Carga Inicial de Datos (Seed)
Para poblar la base de datos con los integrantes del equipo, proyectos y donaciones de prueba:
```bash
npm run seed
```

### Ejecucion del Servidor
Modo produccion / estandar:
```bash
npm start
```

Modo desarrollo con recarga automatica:
```bash
npm run dev
```

El servidor quedara disponible en: `http://localhost:3000`

---

## 5. Endpoints de la API REST

### Personas (`/api/personas`)
- `GET /api/personas`: Obtener todas las personas registradas.
- `GET /api/personas/:id`: Obtener una persona por su ID de MongoDB.
- `POST /api/personas`: Crear una nueva persona (donante o responsable).
- `PUT /api/personas/:id`: Actualizar los datos de una persona existente.
- `DELETE /api/personas/:id`: Eliminar una persona.

### Proyectos (`/api/proyectos`)
- `GET /api/proyectos`: Obtener todos los proyectos (soporta filtro opcional `?categoria=...`).
- `GET /api/proyectos/:id`: Obtener un proyecto por su ID.
- `POST /api/proyectos`: Crear un nuevo proyecto comunitario.
- `PUT /api/proyectos/:id`: Actualizar datos o meta del proyecto.
- `DELETE /api/proyectos/:id`: Eliminar un proyecto.

### Donaciones (`/api/donaciones`)
- `GET /api/donaciones`: Listado completo con referencias cruzadas pobladas (`populate`).
- `GET /api/donaciones/:id`: Detalle de una donacion especifica.
- `POST /api/donaciones`: Registrar una donacion, validando la existencia de la persona y el proyecto, e incrementando automaticamente la recaudacion del proyecto en la base de datos.

---

## 6. Rutas de la Interfaz Web (Pug)
- `/`: Pagina principal con descripcion del proyecto, lista del equipo y resumen de recaudaciones.
- `/proyectos`: Catalogo de proyectos comunitarios con su barra de progreso.
- `/donaciones/nueva`: Formulario amigable para registrar aportes directos mediante selectores vinculados a MongoDB.
