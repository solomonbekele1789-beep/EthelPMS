using MediatR;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Application.Commands.CreateDonor;

public sealed class CreateDonorCommandHandler : IRequestHandler<CreateDonorCommand, Guid>
{
    private readonly IDonorsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateDonorCommandHandler(IDonorsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateDonorCommand request, CancellationToken ct)
    {
        var donor = Donor.Create(
            request.Name, request.Acronym, request.Country, request.Website,
            request.Email, request.Phone, request.Address, request.Notes);

        _db.Donors.Add(donor);
        await _db.SaveChangesAsync(ct);
        return donor.Id;
    }
}
