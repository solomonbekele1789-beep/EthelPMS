using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.RequireComplianceFollowUp;

public sealed record RequireComplianceFollowUpCommand(
    Guid Id,
    DateTime FollowUpDate,
    string Recommendations) : IRequest<Unit>;
