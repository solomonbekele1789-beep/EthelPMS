using MediatR;

namespace NGO.PMS.Donors.Application.Commands.CreateDonor;

public sealed record CreateDonorCommand(
    string Name,
    string? Acronym,
    string? Country,
    string? Website,
    string? Email,
    string? Phone,
    string? Address,
    string? Notes) : IRequest<Guid>;
