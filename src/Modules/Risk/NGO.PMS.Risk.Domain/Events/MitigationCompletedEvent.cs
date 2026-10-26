using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Events;

public sealed record MitigationCompletedEvent(
    Guid MitigationId,
    Guid RiskId) : IDomainEvent;
