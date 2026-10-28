using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Donors;

/// <summary>
/// Fired when a donor grant is activated.
/// Consumed by: FundAccounting (budget allocation), Projects (funding source).
/// </summary>
public sealed record GrantActivatedIntegrationEvent : IntegrationEvent
{
    public Guid GrantId { get; init; }
    public Guid DonorId { get; init; }
    public decimal TotalAmount { get; init; }
}
