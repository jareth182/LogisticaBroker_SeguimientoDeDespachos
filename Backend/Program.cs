using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Repositories;
using LogisticaBroker.Repositories.Interfaces;
using LogisticaBroker.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Conexión a PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository Pattern — registrar aquí
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CloudStorageService>();
builder.Services.AddScoped<ContratoService>();
builder.Services.AddScoped<DAMService>();
builder.Services.AddScoped<DespachoService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<EmpresaService>();
builder.Services.AddScoped<PartidaArancelariaService>();
builder.Services.AddScoped<TrazabilidadService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Usar CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();
app.Run();
