namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record JournalEntryDto
{
    public Guid Id { get; init; }
    public string ReferenceNumber { get; init; } = null!;
    public string Description { get; init; } = null!;
    public DateTime TransactionDate { get; init; }
    public string Status { get; init; } = null!;
    public decimal TotalDebit { get; init; }
    public decimal TotalCredit { get; init; }
    public Guid? ProjectId { get; init; }
    public Guid? FundCodeId { get; init; }
    public string? Memo { get; init; }
    public List<JournalLineDto> Lines { get; init; } = [];
}
