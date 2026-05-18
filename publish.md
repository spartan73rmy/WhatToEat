# 🚀 Guía de Publicación — WhatToEat

## Resumen de URLs

| Componente | URL |
|---|---|
| Frontend (IIS) | `http://192.168.1.254/WhatToEat/` |
| API Backend (proxy IIS) | `http://192.168.1.254/WhatToEat/api/*` |
| API Backend (directo) | `http://localhost:3001/api/*` |

---

## Requisitos Previos

### 1. Módulos IIS instalados

- **URL Rewrite 2.1** — https://www.iis.net/downloads/microsoft/url-rewrite
- **ARR 3.0** — https://www.iis.net/downloads/microsoft/application-request-routing

Verificar instalación:
```powershell
Test-Path "C:\Program Files\IIS\Application Request Routing"  # debe ser True
Test-Path "C:\Program Files\IIS\URL Rewrite Module"           # debe ser True
```

### 2. Proxy ARR habilitado

En IIS Manager → **Application Request Routing Cache** → **Server Proxy Settings** → ✅ **Enable proxy**

Verificar:
```powershell
Select-String -Path "C:\Windows\System32\inetsrv\config\applicationHost.config" -Pattern 'proxy enabled="true"'
```

### 3. Node.js instalado

```powershell
node --version   # v24.14.1
npm --version    # 10.x
```

### 4. PostgreSQL corriendo

```powershell
# Verificar que el servicio PostgreSQL esté activo
Get-Service postgresql* | Select-Object Name,Status
```

### 5. Ollama corriendo

```powershell
curl http://localhost:11434/api/tags
```

### 6. nssm instalado (vía Chocolatey)

```powershell
choco install nssm -y
nssm --version   # NSSM 2.24-101-g897c7ad
```

---

## Proceso de Publicación

### Paso 1 — Clonar o actualizar el código

```powershell
cd C:\Users\ICUE 002\Documents\GitHub\WhatToEat
git pull origin main
```

### Paso 2 — Instalar dependencias

```powershell
npm install
```

### Paso 3 — Build del proyecto

```powershell
npm run build
```

Esto genera:
- `client/dist/` — archivos estáticos del frontend (incluye `web.config` copiado automáticamente)
- `server/dist/` — backend compilado a JavaScript

### Paso 4 — Verificar la aplicación IIS

La aplicación `/WhatToEat` ya debe existir en IIS apuntando a `client/dist/`.

Verificar:
```powershell
& "C:\Windows\System32\inetsrv\appcmd.exe" list app /site.name:"Default Web Site" /path:/WhatToEat
```

Si no existe, crearla:
```powershell
& "C:\Windows\System32\inetsrv\appcmd.exe" add app /site.name:"Default Web Site" /path:/WhatToEat /physicalPath:"C:\Users\ICUE 002\Documents\GitHub\WhatToEat\client\dist"
```

### Paso 5 — Verificar permisos IIS

El Application Pool necesita acceso de lectura a `client/dist/`:

```powershell
# Ejecutar como administrador
$path = "C:\Users\ICUE 002\Documents\GitHub\WhatToEat\client\dist"
$acl = Get-Acl -Path $path
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.AddAccessRule($rule)
Set-Acl -Path $path -AclObject $acl
```

### Paso 6 — Reiniciar el servicio Node.js

```powershell
# Ejecutar como administrador
nssm restart WhatToEatServer

# Verificar que esté corriendo
Get-Service WhatToEatServer | Select-Object Name,Status
```

### Paso 7 — Verificar todo

```powershell
# Frontend
Invoke-WebRequest "http://localhost/WhatToEat/" -UseBasicParsing

# API proxy
Invoke-WebRequest "http://localhost/WhatToEat/api/health" -UseBasicParsing

# API directa
Invoke-WebRequest "http://localhost:3001/api/health" -UseBasicParsing

# PWA manifest
Invoke-WebRequest "http://localhost/WhatToEat/manifest.json" -UseBasicParsing

# Service Worker
Invoke-WebRequest "http://localhost/WhatToEat/sw.js" -UseBasicParsing

# Iconos
Invoke-WebRequest "http://localhost/WhatToEat/icon-192.png" -UseBasicParsing
Invoke-WebRequest "http://localhost/WhatToEat/icon-512.png" -UseBasicParsing
```

---

## Gestión del Servicio Node.js

### Comandos nssm

```powershell
# Iniciar
nssm start WhatToEatServer

# Detener
nssm stop WhatToEatServer

# Reiniciar
nssm restart WhatToEatServer

# Ver estado
nssm status WhatToEatServer

# Ver logs
Get-Content "C:\Users\ICUE 002\Documents\GitHub\WhatToEat\server\service.log" -Tail 20

# Editar configuración (abre GUI)
nssm edit WhatToEatServer

# Eliminar servicio
nssm remove WhatToEatServer confirm
```

### Logs del servicio

- **Archivo:** `server/service.log`
- **Event Viewer:** Windows Logs → Application → filtrar por "nssm" o "WhatToEat"

---

## Rebuild del Frontend

Cada vez que se hace `npm run build`:

1. Vite limpia `client/dist/` y genera los archivos nuevos
2. El postbuild script (`copy /Y web.config dist`) copia `web.config` automáticamente
3. Los archivos de PWA (`manifest.json`, `sw.js`, iconos) están en `client/public/` y Vite los copia a `dist/` automáticamente

**No es necesario** recrear la aplicación IIS ni modificar el `web.config` manualmente después de cada build.

---

## Solución de Problemas

### 500.19 — No se puede leer web.config

```powershell
# Verificar que web.config exista
Test-Path "C:\Users\ICUE 002\Documents\GitHub\WhatToEat\client\dist\web.config"

# Si no existe, copiar manualmente
Copy-Item "client\web.config" "client\dist\web.config"
```

### 401.3 — Unauthorized

```powershell
# Re-aplicar permisos (ejecutar como admin)
$path = "C:\Users\ICUE 002\Documents\GitHub\WhatToEat\client\dist"
$acl = Get-Acl $path
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.AddAccessRule($rule)
Set-Acl $path $acl
```

### 502.3 — Bad Gateway (API no responde)

```powershell
# Verificar que el servicio Node esté corriendo
Get-Service WhatToEatServer

# Verificar que Node escuche en 3001
netstat -ano | Select-String ":3001 "

# Ver logs del servicio
Get-Content "server\service.log" -Tail 30

# Reiniciar servicio
nssm restart WhatToEatServer
```

### PWA no se instala en el móvil

1. Verificar que `manifest.json` sea accesible: `http://192.168.1.254/WhatToEat/manifest.json`
2. Verificar que `sw.js` se registre (abrir DevTools → Application → Service Workers)
3. Asegurarse de que `display: "standalone"` esté en el manifest
4. En Chrome Android: menú → "Add to Home screen"

### Puerto 3001 ocupado

```powershell
# Encontrar proceso
netstat -ano | Select-String ":3001 "

# Matar proceso (reemplazar PID)
taskkill /F /PID <PID>

# Reiniciar servicio
nssm restart WhatToEatServer
```

---

## Estructura de Archivos Clave

```
WhatToEat/
├── client/
│   ├── dist/                    # Build output (IIS physical path)
│   │   ├── index.html
│   │   ├── assets/              # JS, CSS, etc.
│   │   ├── manifest.json        # PWA manifest
│   │   ├── sw.js                # Service Worker
│   │   ├── icon-192.png         # PWA icon
│   │   ├── icon-512.png         # PWA icon
│   │   └── web.config           # IIS rewrite rules
│   ├── public/                  # Static assets (copied to dist by Vite)
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   ├── icon.svg
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── web.config               # Fuente (copiado a dist en postbuild)
│   ├── generate-icons.cjs       # Script para generar PNGs desde SVG
│   └── vite.config.ts           # base: "/WhatToEat/"
├── server/
│   ├── dist/                    # Backend compilado
│   │   └── index.js
│   ├── run-server.bat           # Script para nssm
│   ├── service.log              # Logs del servicio
│   └── .env                     # Variables de entorno (no commiteado)
└── publish.md                   # Esta guía
```

---

## Checklist de Publicación

- [ ] `git pull origin main`
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Verificar `client/dist/web.config` existe
- [ ] `nssm restart WhatToEatServer`
- [ ] `Get-Service WhatToEatServer` → Status: Running
- [ ] `http://192.168.1.254/WhatToEat/` → carga el frontend
- [ ] `http://192.168.1.254/WhatToEat/api/health` → `{"status":"ok"}`
- [ ] `http://192.168.1.254/WhatToEat/manifest.json` → carga el manifest
- [ ] `http://192.168.1.254/WhatToEat/sw.js` → carga el service worker
