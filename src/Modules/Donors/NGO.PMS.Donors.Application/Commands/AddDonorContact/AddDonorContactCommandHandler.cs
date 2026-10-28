using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.AddDonorContact;

public sealed class AddDonorContactCommandHandler : IRequestHandler<AddDonorContactCommand, Guid>
{
    private readonly IDonorsDbContext _db;

    public AddDonorContactCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(AddDonorContactCommand request, CancellationToken ct)
    {
        var donorExists = await _db.Donors.AnyAsync(d => d.Id == request.DonorId, ct);
        if (!donorExists)
            throw new NotFoundException(nameof(Domain.Entities.Donor), request.DonorId);

        var contact = DonorContact.Create(
            request.DonorId, request.FullName, request.Email,
            request.Title, request.Phone, request.IsPrimary);

        _db.DonorContacts.Add(contact);
        await _db.SaveChangesAsync(ct);
        return contact.Id;
    }
}
