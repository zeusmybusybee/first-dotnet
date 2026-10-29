using Api.Data;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register the database: this is the line EF Core was missing
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddCors(opt =>
    opt.AddPolicy("client", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                              // JSON description at /openapi/v1.json
    app.UseSwaggerUI(o =>                          // clickable test page at /swagger
        o.SwaggerEndpoint("/openapi/v1.json", "Api v1"));
}

app.UseCors("client");
app.MapControllers();
app.Run();
