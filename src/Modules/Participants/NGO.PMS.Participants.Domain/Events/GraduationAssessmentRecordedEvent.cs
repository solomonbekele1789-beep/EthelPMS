using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Events;

public sealed record GraduationAssessmentRecordedEvent(
    Guid AssessmentId, Guid ParticipantId, Guid BenchmarkId, decimal Score) : IDomainEvent;
