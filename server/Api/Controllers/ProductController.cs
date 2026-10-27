using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Product>> GetAll() =>
        await db.Products.OrderBy(p => p.Id).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> Get(int id) =>
        await db.Products.FindAsync(id) is { } p ? p : NotFound();

    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Product input)
    {
        var p = await db.Products.FindAsync(id);
        if (p is null) return NotFound();
        p.Name = input.Name;
        p.Price = input.Price;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await db.Products.FindAsync(id);
        if (p is null) return NotFound();
        db.Products.Remove(p);
        await db.SaveChangesAsync();
        return NoContent();
    }
}