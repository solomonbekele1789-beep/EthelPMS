using MediatR;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Commands.RegisterSubGrantee;

public sealed record RegisterSubGranteeCommand(
    string Name,
    string ContactPerson,
    string ContactEmail,
    string? ContactPhone,
    string Country,
    PartnerType PartnerType,
    string? RegistrationNumber,
    string? Address) : IRequest<Guid>;
