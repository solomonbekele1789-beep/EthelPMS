namespace NGO.PMS.Identity.Application.Offices.DTOs;

public record OfficeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = default!;
    public string Code { get; init; } = default!;
    public string OfficeType { get; init; } = "HeadOffice";
    public string? Description { get; init; }
    public string? LocationAddress { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public bool IsActive { get; init; } = true;
    public Guid? ParentOfficeId { get; init; }
    public string? ParentOfficeName { get; init; }
    public string? ParentOfficeCode { get; init; }
    public Guid? LocationId { get; init; }
    public string? LocationName { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record OfficeListItemDto(
    Guid Id,
    string Name,
    string Code,
    string OfficeType,
    string? Description,
    string? LocationAddress,
    double? Latitude,
    double? Longitude,
    bool IsActive,
    Guid? ParentOfficeId,
    string? ParentOfficeName,
    string? ParentOfficeCode,
    int UserCount,
    DateTimeOffset CreatedAt);
