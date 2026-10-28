using MediatR;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Commands.CreateComplianceCheck;

public sealed record CreateComplianceCheckCommand(
    Guid SubGranteeId,
    ComplianceType ComplianceType,
    DateTime CheckDate,
    Guid AssessorId) : IRequest<Guid>;
