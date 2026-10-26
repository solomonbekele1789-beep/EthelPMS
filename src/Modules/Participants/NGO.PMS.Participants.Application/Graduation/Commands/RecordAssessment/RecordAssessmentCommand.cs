using MediatR;

namespace NGO.PMS.Participants.Application.Graduation.Commands.RecordAssessment;

public sealed record RecordAssessmentCommand(
    Guid ParticipantId,
    Guid BenchmarkId,
    decimal Score,
    string? Notes) : IRequest<Guid>;
