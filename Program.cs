using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Services;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 Conexión a PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 Registro de servicios
builder.Services.AddScoped<EmpresaService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DespachoService>();
builder.Services.AddScoped<DAMService>();
builder.Services.AddScoped<TrazabilidadService>();
builder.Services.AddScoped<PartidaArancelariaService>();
builder.Services.AddScoped<ContratoService>();
builder.Services.AddScoped<CloudStorageService>();

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