using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Procurement;

public sealed record PaymentApprovedIntegrationEvent : IntegrationEvent
{
    public Guid PaymentRequestId { get; init; }
    public Guid ProjectId { get; init; }
    public decimal Amount { get; init; }
}
