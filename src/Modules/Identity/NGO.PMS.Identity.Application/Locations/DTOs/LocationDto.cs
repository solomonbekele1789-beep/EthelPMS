namespace NGO.PMS.Identity.Application.Locations.DTOs;

public record LocationDto(
    Guid Id,
    string Name,
    string? NameAm,
    string Level,
    Guid? ParentId);
