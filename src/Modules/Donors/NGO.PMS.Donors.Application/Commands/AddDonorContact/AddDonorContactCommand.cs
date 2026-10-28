using MediatR;

namespace NGO.PMS.Donors.Application.Commands.AddDonorContact;

public sealed record AddDonorContactCommand(
    Guid DonorId,
    string FullName,
    string Email,
    string? Title,
    string? Phone,
    bool IsPrimary) : IRequest<Guid>;
