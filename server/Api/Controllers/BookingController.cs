using Api.Data;
using Api.Dtos;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/controller")]
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

    // POST api/booking
    [HttpPost]
    public async Task<ActionResult<Booking>> Create(CreateBookingDto dto)
    {
        var booking = new Booking
        {
            Name = dto.Name
            //createdat is set by the model default utcnow
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id =  booking.Id }, booking);
    }

    // PUT api/bookings
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateBookingDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking is null) return NotFound();
        
        booking.Name = dto.Name;
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