using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Events;

public sealed record RiskEscalatedEvent(
    Guid RiskId,
    int PreviousScore,
    int NewScore) : IDomainEvent;
