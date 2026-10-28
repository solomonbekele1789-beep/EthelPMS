namespace NGO.PMS.Settings.Application.DTOs;

public record OrgSettingDto
{
    public Guid Id { get; init; }
    public string SettingKey { get; init; } = string.Empty;
    public string SettingValue { get; init; } = string.Empty;
    public string DataType { get; init; } = string.Empty;
    public string? Module { get; init; }
    public string Category { get; init; } = string.Empty;
    public string? Description { get; init; }
}
