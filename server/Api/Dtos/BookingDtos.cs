using System.ComponentModel.DataAnnotations;

namespace Api.Dtos;

public class BookingDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public DateOnly BookingDate { get; set; }

    [Required]
    public TimeOnly BookingTime { get; set; }
}