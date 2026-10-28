using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.CreateGrant;

public sealed class CreateGrantCommandHandler : IRequestHandler<CreateGrantCommand, Guid>
{
    private readonly IDonorsDbContext _db;

    public CreateGrantCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(CreateGrantCommand request, CancellationToken ct)
    {
        var donorExists = await _db.Donors.AnyAsync(d => d.Id == request.DonorId, ct);
        if (!donorExists)
            throw new NotFoundException(nameof(Domain.Entities.Donor), request.DonorId);

        var grant = Grant.Create(
            request.DonorId, request.GrantNumber, request.Title, request.Status,
            request.TotalAmount, request.CurrencyCode, request.StartDate, request.EndDate,
            request.Description, request.ProjectId);

        _db.Grants.Add(grant);
        await _db.SaveChangesAsync(ct);
        return grant.Id;
    }
}
