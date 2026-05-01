using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Repositories;
using LogisticaBroker.Repositories.Interfaces;
using LogisticaBroker.Services;
var builder = WebApplication.CreateBuilder(args);

// 🔹 Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 Conexión a PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository Pattern — registrar aquí
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

var app = builder.Build();

// 🔹 Swagger solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// 🔹 Mapear controladores
app.MapControllers();

app.Run();