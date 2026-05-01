# Logística Broker - Seguimiento de Despachos

## Arquitectura General

Este proyecto implementa una plataforma de logística y seguimiento de despachos aduaneros con una arquitectura separada entre backend y frontend.

### Backend (.NET 8 Web API)
- **Framework**: .NET 8 ASP.NET Core
- **Base de Datos**: PostgreSQL con Entity Framework Core
- **Autenticación**: JWT con RBAC
- **Documentación**: Swagger/OpenAPI
- **Arquitectura**: Controllers → Services → Repository Pattern

### Frontend (Next.js 14)
- **Framework**: Next.js 14 con App Router
- **UI**: Tailwind CSS
- **Lenguaje**: TypeScript
- **Estado**: React hooks y localStorage
- **Arquitectura**: Pages → API Routes → Backend

## Estructura del Proyecto

```
LogisticaBroker_SeguimientoDeDespachos/
├── 📁 Backend (.NET 8)
│   ├── Controllers/          # Controladores REST API
│   │   ├── AuthController.cs       # HU_28 - Iniciar sesión (Kiara)
│   │   ├── DespachoController.cs    # HU_06 - Crear despacho (Jazarelly)
│   │   ├── DAMController.cs         # HU_11 - Generar DAM (Juan & Patrick)
│   │   ├── TrazabilidadController.cs # HU_24 - Panel trazabilidad (Emily)
│   │   ├── PartidaArancelariaController.cs # HU_09 - Asignar partida (Jareth)
│   │   ├── ContratoController.cs     # HU_05 - Firmar contrato (Alvaro)
│   │   └── EmpresaController.cs      # HU_01 - Registrar empresa (Ariana)
│   ├── Services/            # Lógica de negocio
│   ├── Models/              # Entidades y DTOs
│   ├── Data/                # DbContext y configuración BD
│   └── Program.cs           # Configuración y middleware
├── 📁 Frontend (Next.js)
│   └── logisticabroker/
│       ├── app/
│       │   ├── auth/login/           # Página de login
│       │   ├── dashboard/            # Panel principal (HU_24)
│       │   ├── despachos/crear/      # Crear despacho (HU_06)
│       │   ├── dam/generar/          # Generar DAM (HU_11)
│       │   ├── empresas/registrar/   # Registrar empresa (HU_01)
│       │   └── api/                  # API routes proxy
│       ├── components/        # Componentes reutilizables
│       └── public/           # Assets estáticos
└── 📁 Database/              # Migraciones y scripts
```

## User Stories y Asignación

### 🎯 **Sebastian**: HT_01 (Arquitectura Backend y API REST)
- Configuración base del proyecto .NET 8
- Estructura de controllers y servicios
- Configuración de Swagger y middleware
- Implementación de patrones arquitectónicos

### 🎯 **Jareth**: HT_02 (Base de Datos Relacional) y HU_09 (Asignar partida arancelaria)
- Diseño y configuración de PostgreSQL
- Entity Framework Core y migraciones
- API para asignación de partidas arancelarias
- Búsqueda y validación de códigos arancelarios

### 🎯 **Ariana**: HT_04 (Pasarela de correos SMTP) y HU_01 (Registrar datos de empresa)
- Configuración de servicio de email (SMTP)
- API para registro de empresas
- Validación de datos empresariales
- Notificaciones automáticas

### 🎯 **Alvaro**: HT_03 (Almacenamiento en la nube) y HU_05 (Firmar digitalmente contrato)
- Integración con almacenamiento cloud (Azure/AWS)
- API para gestión de contratos
- Firma digital de documentos
- Almacenamiento seguro de archivos

### 🎯 **Kiara**: HU_28 (Iniciar sesión en la plataforma)
- Sistema de autenticación JWT
- Gestión de roles y permisos (RBAC)
- UI de login y logout
- Seguridad de sesiones

### 🎯 **Jazarelly**: HU_06 (Crear despacho de importación)
- Formulario de creación de despachos
- Validación de datos de importación
- Generación de números de despacho
- Estados y flujo de despachos

### 🎯 **Juan y Patrick**: HU_11 (Generar borrador DAM)
- Formulario complejo de DAM
- Cálculos automáticos (valor CIF, pesos)
- Generación de documentos PDF
- Validaciones aduaneras

### 🎯 **Emily**: HU_24 (Gestionar monitoreo en panel de trazabilidad)
- Dashboard con estadísticas en tiempo real
- Gráficos y visualizaciones
- Eventos y actividad reciente
- Filtros y búsquedas avanzadas

## Endpoints API Disponibles

### 🔐 Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### 🏢 Empresas
- `POST /api/empresa/registrar` - Registrar nueva empresa

### 📦 Despachos
- `POST /api/despacho/crear` - Crear nuevo despacho
- `GET /api/despacho/{id}` - Obtener despacho específico
- `GET /api/despacho` - Listar todos los despachos

### 📋 DAM (Declaración Aduanera)
- `POST /api/dam/generar-borrador` - Generar borrador DAM
- `GET /api/dam/{id}/borrador` - Obtener borrador
- `POST /api/dam/{id}/finalizar` - Finalizar DAM

### 📊 Trazabilidad
- `GET /api/trazabilidad/despacho/{id}` - Obtener trazabilidad de despacho
- `POST /api/trazabilidad/evento` - Registrar evento
- `GET /api/trazabilidad/dashboard` - Datos del dashboard

### 🏷️ Partidas Arancelarias
- `POST /api/partidaarancelaria/asignar` - Asignar partida
- `GET /api/partidaarancelaria/buscar/{codigo}` - Buscar partida
- `GET /api/partidaarancelaria/despacho/{id}` - Partidas de despacho

### 📄 Contratos
- `POST /api/contrato/crear` - Crear contrato
- `POST /api/contrato/{id}/firmar` - Firmar contrato
- `GET /api/contrato/{id}` - Obtener contrato
- `GET /api/contrato/{id}/documento` - Descargar documento

## Configuración y Ejecución

### Backend
```bash
# Restaurar paquetes
dotnet restore

# Ejecutar migraciones
dotnet ef database update

# Iniciar servidor
dotnet run
```

### Frontend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
echo "BACKEND_URL=http://localhost:5000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

## Tecnologías Principales

### Backend Stack
- **.NET 8** - Framework principal
- **ASP.NET Core** - Web API
- **Entity Framework Core** - ORM
- **PostgreSQL** - Base de datos
- **Swagger/OpenAPI** - Documentación
- **JWT Bearer** - Autenticación
- **MediatR** - Pattern Mediator
- **Hangfire** - Background jobs

### Frontend Stack
- **Next.js 14** - React framework
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **React Hook Form** - Formularios
- **Lucide React** - Iconos

### DevOps y Cloud
- **Docker** - Contenerización
- **Azure/AWS** - Cloud hosting
- **GitHub Actions** - CI/CD
- **SendGrid** - Email service

## Próximos Pasos

1. **Implementar lógica real** en los servicios (actualmente simulada)
2. **Configurar JWT** con tokens reales
3. **Integrar base de datos** PostgreSQL
4. **Implementar validaciones** de negocio
5. **Agregar tests unitarios** y de integración
6. **Configurar Docker** para desarrollo
7. **Implementar logging** y monitoreo
8. **Optimizar UI/UX** con componentes reutilizables

## Notas Importantes

- La estructura actual es un **esqueleto funcional** que separa correctamente backend y frontend
- Los servicios contienen **lógica simulada** para demostrar la arquitectura
- Los endpoints están **listos para implementarse** con lógica real
- El frontend tiene **formularios completos** conectados a las APIs
- La autenticación está **preparada para JWT** pero usa simulación temporal

---

**Estado**: ✅ Estructura base completada y lista para desarrollo individual de HUs
