namespace Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }        // ? means it can be null
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}