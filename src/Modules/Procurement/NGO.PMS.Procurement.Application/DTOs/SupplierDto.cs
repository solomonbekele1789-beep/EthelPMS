namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record SupplierDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Address { get; init; }
    public string? TaxIdNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal Rating { get; init; }
    public string? BlacklistReason { get; init; }
}
