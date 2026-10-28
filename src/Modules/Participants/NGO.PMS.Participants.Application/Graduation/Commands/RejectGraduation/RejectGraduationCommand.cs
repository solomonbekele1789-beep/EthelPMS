using MediatR;

namespace NGO.PMS.Participants.Application.Graduation.Commands.RejectGraduation;

public sealed record RejectGraduationCommand(
    Guid DecisionId,
    string Reason) : IRequest;
