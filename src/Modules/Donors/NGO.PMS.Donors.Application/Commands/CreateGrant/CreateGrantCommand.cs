using MediatR;
using NGO.PMS.Donors.Domain.Enums;

namespace NGO.PMS.Donors.Application.Commands.CreateGrant;

public sealed record CreateGrantCommand(
    Guid DonorId,
    string GrantNumber,
    string Title,
    GrantStatus Status,
    decimal TotalAmount,
    string CurrencyCode,
    DateTime StartDate,
    DateTime EndDate,
    string? Description,
    Guid? ProjectId) : IRequest<Guid>;
