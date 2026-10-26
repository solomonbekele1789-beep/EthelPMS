using MediatR;

namespace NGO.PMS.Donors.Application.Commands.UpdateDonor;

public sealed record UpdateDonorCommand(
    Guid Id,
    string Name,
    string? Acronym,
    string? Country,
    string? Website,
    string? Email,
    string? Phone,
    string? Address,
    string? Notes) : IRequest<Unit>;
