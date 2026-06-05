# LogisticaBroker — Contexto del Proyecto

## ¿Qué es este proyecto?
Sistema de Gestión Institucional para **Logística Broker Perú S.A.C.**, una agencia de aduanas.
Permite gestionar despachos de importación, onboarding de clientes y trazabilidad de envíos.

## Stack tecnológico
| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | ASP.NET Core 8 (C#) |
| Base de datos | PostgreSQL (via EF Core) |
| Autenticación | JWT Bearer (8h expiry) |
| Email | Gmail SMTP (ya configurado en appsettings.json) |

## Cómo correr el proyecto
```bash
# Backend  (puerto 5018)
cd Backend && dotnet run

# Frontend (puerto 5173)
cd FrontendWeb && npm run dev
```

## Credenciales de prueba
| Rol | Email | Password |
|---|---|---|
| Administrador | admin@test.com | admin123 |
| Cliente | cliente@test.com | cliente123 |

## Roles del sistema
- **Administrador** (IdRol=1): acceso completo — despachos, administración, contratos
- **Cliente** (IdRol=2): portal propio — trazabilidad, documentación, firma contrato
  - Si `estadoEmpresa === 'Pendiente'` → redirige obligatoriamente a firma-contrato al login

## Estructura de carpetas clave

```
FrontendWeb/src/
├── App.jsx                          # Router principal (state-based, sin react-router)
├── Components/
│   ├── Auth/
│   │   ├── Login.jsx                # Pantalla login (diseño tarjeta centrada)
│   │   └── RecuperarContrasena.jsx  # Recuperar contraseña
│   ├── Despachos/
│   │   ├── ListaDespachos.jsx       # Repositorio de despachos
│   │   ├── DetalleDespacho.jsx      # DAM + etapas
│   │   ├── DespachoOperativo.jsx    # Crear nuevo despacho
│   │   ├── ListaLiquidaciones.jsx
│   │   └── ClasificacionArancelaria.jsx
│   ├── Empresa/
│   │   ├── ListaClientes.jsx        # Directorio clientes (tabla paginada + exportar CSV)
│   │   └── RegistrarEmpresa.jsx     # Registrar nuevo cliente (form simple)
│   ├── Contratos/
│   │   ├── FirmaContrato.jsx        # Firma digital del contrato
│   │   └── Documentos.jsx           # Mis documentos (lista contratos)
│   ├── Documentos/
│   │   └── AdjuntarDocumentosLegales.jsx  # Upload de docs legales (rol Cliente)
│   └── Tracking/
│       └── TrackingEnvios.jsx       # Panel de trazabilidad

Backend/
├── Controllers/
│   ├── AuthController.cs            # POST /api/Auth/login, /recuperar-contrasena, /logout
│   ├── EmpresaController.cs         # GET /api/Empresa, POST /api/Empresa/registrar
│   ├── ContratoController.cs        # GET/POST contratos, POST /firmar
│   ├── DespachosController.cs
│   ├── TrazabilidadController.cs
│   └── ...
├── Services/
│   ├── AuthService.cs               # Login + recuperar contraseña
│   ├── EmpresaService.cs            # Registro de empresas
│   ├── EmailService.cs              # Envío de correos (SMTP Gmail)
│   └── ...
├── Models/                          # Entidades EF Core
├── DTOs/                            # LoginDto, RecuperarContrasenaDto, etc.
├── Data/
│   ├── AppDbContext.cs
│   └── DataSeeder.cs                # Datos iniciales (roles, empresa test, usuario test)
└── appsettings.json                 # Config SMTP, JWT, DB connection
```

## Vistas por rol (App.jsx state machine)
### Admin / Operativo
| view | Componente |
|---|---|
| `despachos` | ListaDespachos |
| `nuevo-despacho` | DespachoOperativo |
| `lista` | ListaDespachos (repositorio) |
| `detalle` | DetalleDespacho |
| `trazabilidad` | TrackingEnvios |
| `firma-contrato` | FirmaContrato |
| `documentos` | Documentos |
| `clientes` | ListaClientes |
| `nuevo-cliente` | RegistrarEmpresa |
| `liquidaciones` | ListaLiquidaciones |
| `clasificacion` | ClasificacionArancelaria |

### Cliente
| view | Componente |
|---|---|
| `trazabilidad` | TrackingEnvios |
| `documentacion` | AdjuntarDocumentosLegales |
| `firma-contrato` | FirmaContrato |
| `documentos` | Documentos |

## HUs implementadas
| HU | Descripción | Archivo principal |
|---|---|---|
| Iniciar Sesión | Login con JWT, redirect por rol, redirect forzado si empresa Pendiente | Login.jsx, AuthService.cs |
| Recuperar Contraseña | Email con código de recuperación vía SMTP | RecuperarContrasena.jsx, AuthService.cs |
| Visualizar Directorio Clientes | Tabla paginada, búsqueda RUC/Razón Social, exportar CSV | ListaClientes.jsx |
| Registrar Cliente | Form simple (RUC, Razón Social, Correo, Tel), crea con estado Pendiente | RegistrarEmpresa.jsx |
| Adjuntar Documentos Legales | Upload de 3 docs requeridos, drag&drop, avance a firma al completar | AdjuntarDocumentosLegales.jsx |

## Modelos de base de datos clave
- **Rol**: IdRol, NombreRol (Administrador=1, Cliente=2)
- **Empresa**: IdEmpresa, Ruc, RazonSocial, NombreContacto, Correo, Estado (Pendiente/Afiliado Activo)
- **Usuario**: IdUsuario, IdRol, IdEmpresa, Correo, ContrasenaHash, Estado
- **Despacho**: CodigoBl, IdEmpresa, Nave, Contenedor, EtapasDespacho[]
- **ContratoServicio**: IdEmpresa, EstadoFirma (Pendiente/Firmado)

## Convenciones del proyecto
- Colores primarios: `#1a2540` (navy oscuro, botones CTA), `#008b9c` / `#00b4d8` (cyan, accentos admin)
- Fondo app: `#f8fafc`, fondo login: `#edf1f7`
- Sin react-router — la navegación es por `setView()` en App.jsx
- Sin Redux — estado local + localStorage para sesión
- Tailwind CSS únicamente (sin CSS personalizado)
- Backend siempre en `http://localhost:5018`
- Frontend siempre en `http://localhost:5173`
