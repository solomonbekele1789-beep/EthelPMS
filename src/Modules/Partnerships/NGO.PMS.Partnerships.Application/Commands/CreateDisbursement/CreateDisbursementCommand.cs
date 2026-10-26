using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.CreateDisbursement;

public sealed record CreateDisbursementCommand(
    Guid SubGranteeId,
    Guid? GrantId,
    decimal Amount,
    string Currency,
    DateTime DisbursementDate,
    string ReferenceNumber,
    string Purpose) : IRequest<Guid>;
