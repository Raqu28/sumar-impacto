# Sumar Impacto - Plataforma Comunitaria de Donaciones Solidarias
## Desarrollo Web Backend (DSWB) — Entrega Final (3° Parcial)
### IFTS N° 29 — Segundo Cuatrimestre 2026

**Equipo de Desarrollo:** Grupo 15 - *pITzza & BirrAPI*  
**Integrantes:**
- Guillermo Chacón
- Sonia Raquel Andrada
- Eitel Hugo Belinzoni

**Versión:** `v1.2.0` (SemVer)  
**Despliegue Online:** [https://sumar-impacto.onrender.com](https://sumar-impacto.onrender.com) *(Render Web Service + MongoDB Atlas)*

---

## 1. Descripción del Proyecto y Evolución del Sistema

**Sumar Impacto** es una plataforma web desarrollada en **Node.js** y **Express** con persistencia NoSQL en la nube (**MongoDB Atlas**) mediante el ODM **Mongoose**, renderizado del lado del servidor (**Pug**) y comunicación bidireccional en tiempo real (**WebSockets / Socket.IO**).

### Evolución Arquitectónica (SemVer v1.x)
* **Versión 1.0 (TP1):** Prototipo inicial con almacenamiento en memoria volátil y archivos planos JSON (`fs`).
* **Versión 1.1 (TP2):** Migración a base de datos NoSQL documental local con Mongoose ODM, arquitectura modular MVC, métodos de instancia y vistas SSR en Pug.
* **Versión 1.2 (TP3 - Final):** Incorporación del subsistema de **Seguridad y Autenticación** (hashing nativo PBKDF2 con salt de 16 bytes y SHA-512), gestión de **Sesiones con Cookies HTTP-only**, protección de rutas privadas, persistencia en **MongoDB Atlas**, **WebSockets en tiempo real** para notificación instantánea de aportes, middleware centralizado de manejo de errores, página 404 y despliegue continuo en la nube (**Render**).

---

## 2. Tecnologías Utilizadas

* **Node.js (v18+)**: Entorno de ejecución con soporte nativo de ECMAScript Modules (`"type": "module"`).
* **Express.js (v5.x)**: Framework backend para enrutamiento modular y middlewares.
* **MongoDB Atlas & Community Server**: Base de datos NoSQL documental (en la nube y local).
* **Mongoose (v8.x)**: Modelado de esquemas documentales, validaciones de tipos, métodos de instancia y `populate()`.
* **Socket.IO (v4.x)**: Comunicación WebSocket bidireccional en tiempo real para eventos de donaciones.
* **Crypto (Nativo Node.js)**: Funciones criptográficas `randomBytes` y `pbkdf2Sync` para contraseñas seguras y tokens de sesión.
* **Pug (v3.x)**: Motor de plantillas server-side rendering (SSR) con layouts reutilizables y barra adaptativa.
* **dotenv**: Gestión desacoplada de variables de entorno.

---

## 3. Estructura del Proyecto

```text
sumar-impacto/
│-- config/
│   └── db.js                   # Conexión asincrónica flexible a MongoDB Local / Atlas Cloud
│-- controllers/
│   ├── authController.js       # Autenticación, registro, login con hashing y logout
│   ├── donacionesController.js # Lógica de donaciones, validación y emisión WebSocket
│   ├── personasController.js   # CRUD de personas (donantes y responsables)
│   ├── proyectosController.js  # CRUD de proyectos y filtros RegExp por categoría
│   └── webController.js        # Lógica de navegación web y procesamiento de formularios
│-- middlewares/
│   ├── authMiddleware.js       # Parser de cookies, protegerRuta y cargarUsuarioOpcional
│   └── validarCampos.js        # Validación sintáctica y semántica de datos de entrada
│-- models/
│   ├── Donacion.js             # Esquema con referencias cruzadas ObjectId
│   ├── Persona.js              # Esquema de personas con enumeraciones y timestamps
│   ├── Proyecto.js             # Esquema con métodos de instancia (actualizarRecaudacion)
│   └── Usuario.js              # Esquema de usuarios con métodos PBKDF2 y validación de hash
│-- public/
│   └── styles.css              # Estilos visuales institucionales, alertas toast y formularios
│-- routes/
│   ├── authRoutes.js           # Rutas web y API de autenticación (/login, /registro, /logout)
│   ├── donacionesRoutes.js     # Endpoints REST para donaciones
│   ├── personasRoutes.js       # Endpoints REST para personas
│   ├── proyectosRoutes.js      # Endpoints REST para proyectos
│   └── webRoutes.js            # Rutas de vistas web SSR (Home, Proyectos, Donar)
│-- views/
│   ├── layout.pug              # Plantilla base, barra de navegación adaptativa y cliente Socket.IO
│   ├── index.pug               # Home con resumen de causas, tabla interactiva y alertas en vivo
│   ├── proyectos.pug           # Catálogo de proyectos comunitarios con avance
│   ├── nueva-donacion.pug      # Formulario protegido para registrar aportes solidarios
│   ├── login.pug               # Formulario de inicio de sesión
│   ├── registro.pug            # Formulario de alta de usuario con selección de rol
│   └── 404.pug                 # Vista amigable para recursos y rutas no encontradas
│-- .env.example                # Plantilla documentada de variables de entorno
│-- index.js                    # Servidor HTTP + WebSocket, middlewares y manejador de errores
│-- package.json                # Configuración SemVer v1.2.0 y scripts de ejecución
│-- seed.js                     # Script de inicialización de datos de prueba en MongoDB
│-- test_e2e.js                 # Batería integral de pruebas automatizadas (19/19 asserts)
└── README.md                   # Documentación técnica completa
```

---

## 4. Instalación y Ejecución Local

### Requisitos Previos
* Node.js v18 o superior instalado.
* MongoDB Community Server local o una cuenta en MongoDB Atlas.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Raqu28/sumar-impacto.git
cd sumar-impacto
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copiar el archivo de plantilla `.env.example` como `.env`:
```bash
cp .env.example .env
```
Asegurar que `MONGO_URI` apunte a la base de datos local o de Atlas:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/sumar_impacto
```

### 4. Poblado de la Base de Datos (Seed)
Ejecutar el script para cargar los usuarios de prueba, personas, causas y donaciones iniciales:
```bash
npm run seed
```
*Credenciales de prueba generadas:*
* **Admin:** `admin@sumarimpacto.org` / `admin1234`
* **Donante:** `guillermo.chacon@ifts29.edu.ar` / `guille1234`
* **Responsable:** `sonia.andrada@ifts29.edu.ar` / `raquel1234`
* **Donante:** `eitel.belinzoni@ifts29.edu.ar` / `eitel1234`

### 5. Iniciar la Aplicación
Modo producción:
```bash
npm start
```
Modo desarrollo (con reinicio automático):
```bash
npm run dev
```
Acceder en el navegador a: `http://localhost:3000`

### 6. Ejecutar Batería de Pruebas Automatizadas
```bash
npm test
```
Ejecuta la suite integral `test_e2e.js` verificando el 100% de los endpoints, autenticación, cookies, validaciones y códigos de estado HTTP.

---

## 5. Endpoints Principales

### Autenticación y Sesiones
* `GET /login` y `POST /login`: Formulario e inicio de sesión con generación de cookie HTTP-only.
* `GET /registro` y `POST /registro`: Formulario y registro de nuevo usuario con contraseña cifrada.
* `GET /logout` y `POST /logout`: Cierre de sesión e invalidación del token.
* `POST /api/auth/login` y `POST /api/auth/registro`: Endpoints REST para autenticación programática.

### Gestión de Causas y Donaciones
* `GET /`: Página de inicio con tabla de proyectos y notificaciones en vivo.
* `GET /proyectos`: Listado completo de proyectos.
* `GET /donaciones/nueva`: Formulario protegido (requiere login) para registrar aportes.
* `POST /donaciones/nueva`: Procesa la donación, actualiza la recaudación y emite evento en tiempo real vía WebSocket.
* `GET /api/proyectos`: API REST de proyectos (admite filtro `?categoria=...`).
* `GET /api/donaciones`: API REST con referencias cruzadas completas (`populate()`).
