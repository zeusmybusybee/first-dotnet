using Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Booking> Bookings => Set<Booking>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.Property(b => b.Name).IsRequired().HasMaxLength(200);
            entity.Property(b => b.Email).IsRequired().HasMaxLength(200);

            entity.HasIndex(b => new { b.BookingDate, b.BookingTime }).IsUnique();
        });
    }
}

