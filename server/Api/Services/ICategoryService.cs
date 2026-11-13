using Api.Dtos;

namespace Api.Services;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetAllAsync();
    Task<CategoryResponse?> GetByIdAsync(int id);
    Task<CategoryResponse> CreateAsync(CategoryRequest request);
    Task<bool> UpdateAsync(int id, CategoryRequest request);
    Task<bool> DeleteAsync(int id);
    Task<bool> NameExistsAsync(string name, int? exceptId = null);
}