using Api.Dtos;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]                       // automatic validation + 400 responses
[Route("api/[controller]")]           // → /api/categories
public class CategoriesController(ICategoryService service) : ControllerBase
{
    // GET /api/categories
    [HttpGet]
    public async Task<ActionResult<List<CategoryResponse>>> GetAll() =>
        Ok(await service.GetAllAsync());

    // GET /api/categories/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> GetById(int id)
    {
        var category = await service.GetByIdAsync(id);
        return category is null ? NotFound() : Ok(category);
    }

    // POST /api/categories
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(CategoryRequest request)
    {
        if (await service.NameExistsAsync(request.Name))
            return Conflict(new { message = $"Category '{request.Name}' already exists." });

        var created = await service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/categories/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CategoryRequest request)
    {
        if (await service.NameExistsAsync(request.Name, exceptId: id))
            return Conflict(new { message = $"Category '{request.Name}' already exists." });

        return await service.UpdateAsync(id, request) ? NoContent() : NotFound();
    }

    // DELETE /api/categories/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await service.DeleteAsync(id) ? NoContent() : NotFound();
}