using Api.Data;
using Api.Dtos;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingsController(AppDbContext db)
    {
        _db = db;
    }

    // GET for api/bookings
    [HttpGet]
    public async Task<ActionResult<List<Booking>>> GetAll()
    {
        return await _db.Bookings
            .AsNoTracking()
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }
    // GET for api/booking/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Booking>> GetById(int id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if(booking is null) return NotFound();
        return booking;
    }

    // POST api/bookings
    [HttpPost]
    public async Task<ActionResult<Booking>> Create(BookingDto dto)
    {
        if (dto.BookingDate < DateOnly.FromDateTime(DateTime.UtcNow))
            return BadRequest("Booking date cannot be in the past.");

        var taken = await _db.Bookings.AnyAsync(b => 
            b.BookingDate == dto.BookingDate && b.BookingTime == dto.BookingTime);
        if (taken)
            return Conflict("That time slot is already booked.");

        var booking = new Booking
        {
            Name = dto.Name,
            Email = dto.Email,
            BookingDate = dto.BookingDate,
            BookingTime = dto.BookingTime
            //createdat is set by the model default utcnow
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id =  booking.Id }, booking);
    }

    // PUT api/bookings
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BookingDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking is null) return NotFound();

        var taken = await _db.Bookings.AnyAsync(b => 
            b.Id != id &&
            b.BookingDate == dto.BookingDate && 
            b.BookingTime == dto.BookingTime);
        if (taken)
            return Conflict("That time slot is already booked.");
        
        booking.Name = dto.Name;
        booking.Email = dto.Email;
        booking.BookingDate = dto.BookingDate;
        booking.BookingTime = dto.BookingTime;
        booking.UpdateAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/booking/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking is null) return NotFound();

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}