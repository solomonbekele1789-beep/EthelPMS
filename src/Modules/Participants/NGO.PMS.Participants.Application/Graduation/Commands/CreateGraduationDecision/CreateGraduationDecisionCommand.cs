using MediatR;

namespace NGO.PMS.Participants.Application.Graduation.Commands.CreateGraduationDecision;

public sealed record CreateGraduationDecisionCommand(
    Guid ParticipantId,
    Guid ProjectId,
    string? Notes) : IRequest<Guid>;
