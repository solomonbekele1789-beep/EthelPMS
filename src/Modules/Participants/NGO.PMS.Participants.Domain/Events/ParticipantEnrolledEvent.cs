using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Events;

public sealed record ParticipantEnrolledEvent(
    Guid ParticipantId, Guid ProjectId, Guid EnrollmentId) : IDomainEvent;
