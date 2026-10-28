using MediatR;

namespace NGO.PMS.Participants.Application.Graduation.Commands.ApproveGraduation;

public sealed record ApproveGraduationCommand(Guid DecisionId) : IRequest;
