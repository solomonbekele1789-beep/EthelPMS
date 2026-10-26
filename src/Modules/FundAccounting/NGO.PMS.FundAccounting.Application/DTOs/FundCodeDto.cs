namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record FundCodeDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = null!;
    public string Name { get; init; } = null!;
    public string FundType { get; init; } = null!;
    public string? Description { get; init; }
    public Guid? DonorGrantId { get; init; }
    public bool IsActive { get; init; }
}
