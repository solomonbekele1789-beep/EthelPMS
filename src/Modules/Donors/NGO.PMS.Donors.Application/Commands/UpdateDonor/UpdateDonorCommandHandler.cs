using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.UpdateDonor;

public sealed class UpdateDonorCommandHandler : IRequestHandler<UpdateDonorCommand, Unit>
{
    private readonly IDonorsDbContext _db;

    public UpdateDonorCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateDonorCommand request, CancellationToken ct)
    {
        var donor = await _db.Donors.FirstOrDefaultAsync(d => d.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Donor), request.Id);

        donor.Update(request.Name, request.Acronym, request.Country, request.Website,
            request.Email, request.Phone, request.Address, request.Notes);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
