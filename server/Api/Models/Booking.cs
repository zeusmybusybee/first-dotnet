namespace Api.Models;

public class Booking
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateOnly BookingDate { get; set; }
    public TimeOnly BookingTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ? UpdateAt { get; set; }

}