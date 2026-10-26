using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.CompleteComplianceCheck;

public sealed record CompleteComplianceCheckCommand(
    Guid Id,
    int Score,
    string Findings) : IRequest<Unit>;
