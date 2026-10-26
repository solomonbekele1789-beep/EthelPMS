namespace NGO.PMS.Identity.Application.Offices.DTOs;

public record OfficeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = default!;
    public string Code { get; init; } = default!;
    public Guid? ParentOfficeId { get; init; }
    public string? ParentOfficeName { get; init; }
    public Guid? LocationId { get; init; }
    public string? LocationName { get; init; }
}

public record OfficeListItemDto(
    Guid Id,
    string Name,
    string Code,
    string? ParentOfficeName,
    int UserCount);
