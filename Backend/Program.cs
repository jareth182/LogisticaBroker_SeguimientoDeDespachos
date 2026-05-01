using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Repositories;
using LogisticaBroker.Repositories.Interfaces;
using LogisticaBroker.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Conexión a PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository Pattern — registrar aquí
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
// Repositorios individuales
builder.Services.AddScoped<IDespachoRepository, DespachoRepository>();
builder.Services.AddScoped<IDamRepository, DamRepository>();
builder.Services.AddScoped<IEmpresaRepository, EmpresaRepository>();
builder.Services.AddScoped<IPartidaArancelariaRepository, PartidaArancelariaRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CloudStorageService>();
builder.Services.AddScoped<ContratoService>();
builder.Services.AddScoped<DAMService>();
builder.Services.AddScoped<DespachoService>();
builder.Services.AddScoped<PartidaArancelariaService>();
builder.Services.AddScoped<TrazabilidadService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
