namespace NGO.PMS.Contracts.IntegrationEvents.FundAccounting;

/// <summary>
/// Published when a journal entry is posted (status transitions to Posted).
/// Consumed by: Projects (update actuals), Reporting (financial summaries),
/// MEAL (expenditure tracking).
/// </summary>
public sealed record JournalEntryPostedIntegrationEvent : IntegrationEvent
{
    public Guid JournalEntryId { get; init; }
    public decimal TotalAmount { get; init; }
    public Guid? ProjectId { get; init; }
}
