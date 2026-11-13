using Api.Data;
using Api.Dtos;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class CategoryService(AppDbContext db) : ICategoryService
{
    public async Task<List<CategoryResponse>> GetAllAsync() =>
        await db.Categories
            .AsNoTracking()                       // read-only query, faster
            .OrderBy(c => c.Name)
            .Select(c => ToResponse(c))
            .ToListAsync();

    public async Task<CategoryResponse?> GetByIdAsync(int id)
    {
        var c = await db.Categories.FindAsync(id);
        return c is null ? null : ToResponse(c);
    }

    public async Task<CategoryResponse> CreateAsync(CategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();              // INSERT happens here; Id gets filled in
        return ToResponse(category);
    }

    public async Task<bool> UpdateAsync(int id, CategoryRequest request)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return false;

        category.Name = request.Name.Trim();
        category.Description = request.Description?.Trim();
        await db.SaveChangesAsync();              // EF detects what changed and runs UPDATE
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return false;

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return true;
    }

    public Task<bool> NameExistsAsync(string name, int? exceptId = null) =>
        db.Categories.AnyAsync(c =>
            c.Name.ToLower() == name.Trim().ToLower() && c.Id != exceptId);

    // Model → DTO mapping in one place
    private static CategoryResponse ToResponse(Category c) =>
        new(c.Id, c.Name, c.Description, c.CreatedAt);
}