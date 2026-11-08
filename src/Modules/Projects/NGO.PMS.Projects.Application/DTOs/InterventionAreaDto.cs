namespace NGO.PMS.Projects.Application.DTOs;

public record InterventionAreaDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string AreaType { get; init; } = "Region";
    public string? Description { get; init; }
    public int Level { get; init; }
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public double? Altitude { get; init; }
    public double? Accuracy { get; init; }
    public string? GpsSource { get; init; }
    public string? LandmarkOrAddress { get; init; }
    public Guid? ParentId { get; init; }
    public string? ParentName { get; init; }
    public List<InterventionAreaDto> Children { get; init; } = [];
}
