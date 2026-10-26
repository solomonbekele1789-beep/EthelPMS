using MediatR;

namespace NGO.PMS.Partnerships.Application.Commands.UpdateSubGrantee;

public sealed record UpdateSubGranteeCommand(
    Guid Id,
    string Name,
    string ContactPerson,
    string ContactEmail,
    string? ContactPhone,
    string? Address,
    string? Notes) : IRequest<Unit>;
