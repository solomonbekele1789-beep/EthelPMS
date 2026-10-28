using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Events;

public sealed record ParticipantGraduatedEvent(
    Guid ParticipantId, Guid ProjectId, Guid DecisionId) : IDomainEvent;
