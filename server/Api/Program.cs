using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// ---- DbContext (PostgreSQL) ----
// Connection string resolution:
//   1. `ConnectionString` env var (passed by docker-compose.yml) - highest priority
//   2. connectionStrings:Default in appsettings (dev)
var connectionString = builder.Configuration["ConnectionString"]
                   ?? builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<Api.Data.AppDbContext>(options =>
{
    options.UseNpgsql(connectionString ?? throw new InvalidOperationException(
        "Connection string for PostgreSQL was not configured."));
});

// ---- Swagger / OpenAPI ----
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "first-dotnet API", Version = "v1" });
});

var app = builder.Build();

// ---- Auto-apply migrations on startup (dev convenience) ----
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Api.Data.AppDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not apply migrations automatically.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "first-dotnet API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();

