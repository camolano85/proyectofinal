# Proyecto Final: Ruleta (Backend + Frontend)

Este repositorio contiene una API en Node.js para administrar ruletas de apuestas y un frontend en Angular que consume dicha API. La guía de abajo explica cómo instalar, ejecutar, probar y desplegar ambos componentes.

---

## 1) Arquitectura rápida

- **Backend**: Node.js + Express + Mongoose (MongoDB).  
  Endpoints para crear, abrir, apostar y cerrar una ruleta.
- **Frontend**: Angular (aplicación standalone con Angular Material).  
  UI básica para listar ruletas y realizar apuestas.
- **Servidor web**: Nginx sirviendo el frontend estático y haciendo proxy de `/api` al backend en `http://127.0.0.1:4000`.
- **Gestión de procesos**: PM2 para mantener el backend en ejecución (opcional).

---

## 2) Requisitos

- Node.js 18+
- MongoDB (local o remoto)
- NPM 9+
- Nginx (para despliegue en servidor)
- Chromium o Google Chrome (para ejecutar pruebas del frontend en headless, opcional)

---

## 3) Backend

### 3.1 Configuración

Ubicación: `backend/`.

Variables de entorno esperadas (archivo `.env` en `backend/` o variables de sistema):

```ini
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/proyecto4
NODE_ENV=production
```

### 3.2 Scripts útiles

Desde `backend/`:

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
node src/app.js

# Pruebas
npm test

# Pruebas con cobertura
npm run test:cov
```

> Las pruebas usan Jest y contemplan flujos E2E y validaciones de endpoints.

### 3.3 Endpoints principales

Base URL: `http://127.0.0.1:4000/api/roulettes`

- `GET /api/roulettes`  
  Lista ruletas.

- `POST /api/roulettes`  
  Crea una ruleta. Respuesta: `{ id: "<RID>" }`.

- `PATCH /api/roulettes/:id/open`  
  Abre la ruleta para aceptar apuestas.

- `POST /api/roulettes/:id/bets`  
  Crea una apuesta. Cuerpo esperado (uno de los dos tipos):
  ```json
  { "amount": 100, "type": "number", "number": 17 }
  { "amount": 100, "type": "color", "color": "rojo" }
  ```

- `PATCH /api/roulettes/:id/close`  
  Cierra la ruleta y devuelve resultados, número y color ganador.

### 3.4 Ejecutar con PM2 (opcional)

```bash
pm2 start src/app.js --name proyecto4-backend
pm2 logs proyecto4-backend --lines 100
pm2 restart proyecto4-backend --update-env
```

---

## 4) Frontend (Angular)

Ubicación: `frontend/app`.

### 4.1 Configuración

Ajusta la URL de la API en el servicio Angular si es necesario. Normalmente apuntará a `/api/roulettes` para aprovechar el proxy de Nginx:
```ts
// src/app/services/roulette.service.ts
private baseUrl = '';
private api = `${this.baseUrl}/api/roulettes`;
```

### 4.2 Instalación, pruebas y build

Desde `frontend/app`:

```bash
# Instalar dependencias
npm install

# Ejecutar pruebas (headless) con cobertura
export CHROME_BIN=/usr/bin/chromium
export NODE_OPTIONS=--max_old_space_size=2048
npm test

# Compilar para producción
ng build --configuration production
```

El build de producción se genera en:
```
frontend/app/dist/app/browser
```

### 4.3 Despliegue con Nginx

Copiar el build al docroot público (ejemplo):

```bash
mkdir -p /var/www/proyecto4-ruleta/app/browser
cp -a frontend/app/dist/app/browser/. /var/www/proyecto4-ruleta/app/browser/

# Permisos recomendados
chown -R www-data:www-data /var/www/proyecto4-ruleta
find /var/www/proyecto4-ruleta -type d -exec chmod 755 {} \;
find /var/www/proyecto4-ruleta -type f -exec chmod 644 {} \;
```

Bloque de servidor Nginx típico:

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /var/www/proyecto4-ruleta/app/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Bloquear archivos ocultos
    location ~ /\.(?!well-known) { deny all; }
}
```

Después de editar, validar y recargar:
```bash
nginx -t && systemctl reload nginx
```

---

## 5) Pruebas automatizadas

### Backend (Jest)
- Ejecutar con `npm test` o `npm run test:cov` en `backend/`.
- Valida flujos completos y reglas de negocio (apuestas válidas, rangos, estados, etc.).

### Frontend (Karma + Jasmine)
- Requiere Chrome/Chromium para modo headless.  
- Variables útiles en servidores sin interfaz:
  ```bash
  export CHROME_BIN=/usr/bin/chromium
  export NODE_OPTIONS=--max_old_space_size=2048
  ```
- Ejecutar: `npm test` en `frontend/app`.
- Cobertura se escribe en `frontend/app/coverage/`.

---

## 6) Solución de problemas comunes

- **Nginx 403 Forbidden**  
  Asegúrate de que `root` apunte a la carpeta con `index.html` (por ejemplo, `/var/www/proyecto4-ruleta/app/browser`) y que los permisos sean 755 para carpetas y 644 para archivos, propietario `www-data`.

- **Nginx 500 / 404 a `/index.html`**  
  Suele ser permisos o `root` incorrecto. Verifica `error.log` y la existencia de `index.html` en el docroot.

- **El frontend no carga estilos o Angular Material**  
  Instala `@angular/material` y `@angular/cdk`, e importa un tema en `src/styles.scss`:
  ```scss
  @import '@angular/material/prebuilt-themes/indigo-pink.css';
  ```

- **Karma: builder o plugins faltantes**  
  Asegúrate de tener `@angular-devkit/build-angular` instalado en el frontend:  
  `npm i -D @angular-devkit/build-angular`

- **Pruebas detenidas por memoria**  
  Sube el límite: `export NODE_OPTIONS=--max_old_space_size=2048`

- **Errores de “not a known element” en specs**  
  En tests de componentes, importa explícitamente los módulos/materiales usados y `provideHttpClient`, `provideRouter` si el componente lo necesita.

---

## 7) Entrega y cobertura mínima

- API funcional con endpoints solicitados.
- Frontend consumiendo la API (crear, abrir, apostar, cerrar, listar).
- Pruebas del backend y frontend con cobertura básica.
- Build de producción desplegado detrás de Nginx.

---

## 8) Comandos rápidos (resumen)

```bash
# Backend
cd backend
npm i
npm test
npm run test:cov
node src/app.js   # o pm2 start src/app.js --name proyecto4-backend

# Frontend
cd frontend/app
npm i
export CHROME_BIN=/usr/bin/chromium
export NODE_OPTIONS=--max_old_space_size=2048
npm test
ng build --configuration production

# Despliegue (Nginx)
mkdir -p /var/www/proyecto4-ruleta/app/browser
cp -a dist/app/browser/. /var/www/proyecto4-ruleta/app/browser/
chown -R www-data:www-data /var/www/proyecto4-ruleta
nginx -t && systemctl reload nginx
```

---

## 9) Licencia

Uso académico / demostración. Ajusta la licencia según tus necesidades.