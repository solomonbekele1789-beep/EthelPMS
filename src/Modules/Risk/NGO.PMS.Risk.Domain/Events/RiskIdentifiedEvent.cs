using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Events;

public sealed record RiskIdentifiedEvent(
    Guid RiskId,
    Guid ProjectId,
    int RiskScore) : IDomainEvent;
