using System.ComponentModel.DataAnnotations;

namespace Api.Dtos;

// What the client sends to create or update
public record CategoryRequest(
    [Required, StringLength(50, MinimumLength = 2)] string Name,
    [StringLength(200)] string? Description
);

// What the API sends back
public record CategoryResponse(
    int Id,
    string Name,
    string? Description,
    DateTime CreatedAt
);