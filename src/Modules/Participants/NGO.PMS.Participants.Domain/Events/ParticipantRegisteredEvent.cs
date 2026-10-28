using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Events;

public sealed record ParticipantRegisteredEvent(
    Guid ParticipantId, string FullName) : IDomainEvent;
