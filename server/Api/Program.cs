using System.Text;
using Api.Data;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddCors(opt =>
    opt.AddPolicy("client", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));   // needed if the browser calls the API directly with cookies

// ---- Authentication (JWT read from an HttpOnly cookie) ----
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                ctx.Token = ctx.Request.Cookies["access_token"];
                return Task.CompletedTask;
            }
        };
    });

// ---- Authorization: everything needs login unless marked [AllowAnonymous] ----
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build())
    .AddPolicy("AdminOnly", p => p.RequireRole("Admin"));

// ---- Rate limit for login ----
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.AddFixedWindowLimiter("login", l =>
    {
        l.PermitLimit = 5;
        l.Window = TimeSpan.FromMinutes(1);
    });
});

var app = builder.Build();

// ---- Seed the first admin from user-secrets ----
using (var scope = app.Services.CreateScope())
{
    var seedDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var adminEmail = builder.Configuration["Admin:Email"]?.Trim().ToLowerInvariant();
    var adminPassword = builder.Configuration["Admin:Password"];

    if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword)
        && !seedDb.Users.Any())
    {
        var admin = new User { Email = adminEmail, Role = "Admin" };
        admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, adminPassword);
        seedDb.Users.Add(admin);
        seedDb.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();             // otherwise the fallback policy blocks it
    app.UseSwaggerUI(o =>
        o.SwaggerEndpoint("/openapi/v1.json", "Api v1"));
}

app.UseCors("client");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();