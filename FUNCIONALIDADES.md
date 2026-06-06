# Guía de Funcionalidades - LogisticaBroker

## 🚀 Inicio Rápido

### Windows (PowerShell)
```powershell
.\iniciar_plataforma.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x iniciar_plataforma.sh
./iniciar_plataforma.sh
```

---

## 👤 VISTA ADMINISTRADOR (admin@test.com / admin123)

### 1. **Crear Nuevo Despacho**
- Menu: `Despachos` → `Crear Nuevo Despacho`
- Llena los datos:
  - Código BL (ej: BL2025001)
  - Nave
  - Contenedor
  - Selecciona una empresa cliente
- Clic en `Guardar`
- El despacho se crea con estado "En Proceso"

### 2. **Repositorio de Despachos**
- Menu: `Repositorio` → `Despachos`
- Visualiza tabla paginada con todos los despachos
- Funcionalidades:
  - Buscar por código BL
  - Ordenar por fecha/estado
  - Ver detalles de cada despacho

### 3. **Detalles del Despacho (DAM + Etapas)**
- Desde el Repositorio, clic en cualquier despacho
- Panel izquierdo: **DAM (Documento de Aduanal Maestro)**
  - Datos de nave, contenedor, empresa
  - Editar información
- Panel derecho: **4 Etapas del Despacho**
  1. Pre-Desaduanización
  2. Desaduanización
  3. Post-Desaduanización
  4. Entrega
  - Cambia estado manualmente o automático según progreso
  - Cada etapa muestra fecha/hora y responsable

### 4. **Directorio de Clientes**
- Menu: `Clientes` → `Directorio`
- Tabla paginada con:
  - RUC
  - Razón Social
  - Email
  - Teléfono
  - Estado (Pendiente / Afiliado Activo)
- Opciones:
  - **Buscar**: Por RUC o Razón Social
  - **Exportar CSV**: Descarga todos los clientes

### 5. **Registrar Nuevo Cliente**
- Menu: `Clientes` → `Nuevo Cliente`
- Formulario:
  - RUC (10-11 dígitos)
  - Razón Social
  - Email contacto
  - Teléfono
- Clic en `Registrar`
- El cliente se crea con estado **"Pendiente"**
  - Será obligado a firmar contrato al ingresar
  - Luego cambia a "Afiliado Activo"

### 6. **Trazabilidad de Envíos**
- Menu: `Tracking` → `Seguimiento`
- Visualiza timeline de estados de cada despacho
- Estados visibles:
  - En Proceso (naranja)
  - Completado (verde)
  - Cancelado (rojo)
- Clickea en envío para ver historial completo

### 7. **Liquidaciones**
- Menu: `Liquidaciones`
- Ver pagos pendientes/completados
- Generar reportes de cobranza

### 8. **Clasificación Arancelaria**
- Menu: `Clasificación Arancelaria`
- Búsqueda de productos por categoría
- Ver arancel, impuestos asociados

---

## 👥 VISTA CLIENTE (cliente@test.com / cliente123)

### 1. **Trazabilidad de Envíos**
- Menu: `Seguimiento`
- Ver despachos propios en timeline
- Estados visibles desde perspectiva del cliente
- Solo ve despachos de su empresa

### 2. **Adjuntar Documentos Legales**
- Menu: `Documentación`
- Requiere 3 documentos:
  1. Acta de constitución
  2. RUC
  3. DNI del representante legal
- Opciones de upload:
  - Click para explorar archivos
  - **Drag & drop** en el área gris
- Indicador de progreso (0/3, 1/3, 2/3, 3/3)
- **Importante**: Al completar los 3 docs, se habilita automáticamente el botón "Firma de Contrato"

### 3. **Firmar Contrato**
- Menu: `Firma Contrato`
- Visualiza términos del contrato
- Ingresa datos del firmante:
  - Nombre completo
  - DNI
  - Cargo
- Clic en `Firmar Digitalmente`
- Contrato firmado = cliente pasa a estado "Afiliado Activo"

### 4. **Mis Documentos**
- Menu: `Documentos`
- Descarga contratos firmados
- Ver historial de documentación enviada

---

## 🔗 Flujo Completo de Onboarding de Cliente

```
1. Admin registra cliente (Pendiente)
          ↓
2. Cliente inicia sesión
          ↓
3. Sistema redirige a: Firma de Contrato (antes debe adjuntar docs)
          ↓
4. Cliente adjunta 3 docs (Documentación)
          ↓
5. Cliente firma contrato digitalmente (Firma Contrato)
          ↓
6. Sistema cambia a "Afiliado Activo"
          ↓
7. Cliente ve menu completo (Seguimiento, Documentos, etc)
```

---

## 📊 Datos de Prueba Precargados

Al ejecutar las migraciones, la BD incluye:

### Empresas:
- **Test Logistics S.A.C.** (RUC: 20123456789) - Afiliada Activa
- **Cargo Express Perú** (RUC: 20987654321) - Pendiente

### Usuarios:
- **admin@test.com** / admin123 (Rol: Administrador)
- **cliente@test.com** / cliente123 (Rol: Cliente, empresa: Test Logistics)

### Despachos de Prueba:
- BL2025001, BL2025002, BL2025003 (en diversas etapas)

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
cd Backend
dotnet clean
dotnet restore
dotnet run
```

### Frontend lento o no carga
```bash
cd FrontendWeb
npm install
npm run dev
```

### Base de datos vacía o errores
```bash
cd Backend
dotnet ef database drop -f
dotnet ef database update
```

### Puerto 5018 o 5173 ocupado
```powershell
# Encontrar proceso en puerto
netstat -ano | findstr :5018

# Matar proceso
taskkill /PID <PID> /F
```

---

## 🔐 JWT Token & Autenticación

- **Expiración**: 8 horas
- **Método**: Bearer Token (Authorization header)
- **Almacenamiento**: localStorage (clave: `authToken`)
- **Logout**: Limpia token y localStorage

---

## 📧 Email Configurado

Sistema usa Gmail SMTP para:
- Recuperar contraseña
- Confirmación de documentos
- Notificaciones (pendiente)

Email: `delacruzvallesalaska21@gmail.com`
(Contraseña de app guardada en `appsettings.json`)

---

## 🎨 Diseño & Colores

| Elemento | Color |
|----------|-------|
| Botones CTA | `#1a2540` (navy) |
| Acentos | `#008b9c` / `#00b4d8` (cyan) |
| Fondo app | `#f8fafc` (gris claro) |
| Fondo login | `#edf1f7` |
| Borde tablas | `#e2e8f0` |

---

## 📚 API Endpoints Principales

```
POST   /api/Auth/login                    # Login
POST   /api/Auth/logout                   # Logout
POST   /api/Auth/recuperar-contrasena     # Recuperar contraseña
GET    /api/Empresa                       # Listar empresas
POST   /api/Empresa/registrar             # Registrar empresa
GET    /api/Despachos                     # Listar despachos
POST   /api/Despachos                     # Crear despacho
GET    /api/Despachos/{id}                # Detalle despacho
PUT    /api/Despachos/{id}                # Actualizar etapas
GET    /api/Contrato                      # Listar contratos
POST   /api/Contrato/firmar               # Firmar contrato
POST   /api/Documentos/upload             # Upload documentos
```

Ver Swagger completo en: `http://localhost:5018/swagger/ui`

---

## ✅ Checklist de Funcionalidades

- [ ] Login como Admin
- [ ] Login como Cliente
- [ ] Recuperar contraseña
- [ ] Crear despacho (Admin)
- [ ] Ver repositorio despachos
- [ ] Editar etapas del despacho
- [ ] Ver directorio clientes
- [ ] Registrar nuevo cliente
- [ ] Exportar clientes a CSV
- [ ] Adjuntar documentos (Cliente)
- [ ] Firmar contrato (Cliente)
- [ ] Descargar documentos propios
- [ ] Ver trazabilidad (Admin & Cliente)
- [ ] Logout

---

**Última actualización**: 2026-06-06
**Versión**: Sprint 2 (Documentación + Facturación)
