using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.RecordCommunication;

public sealed class RecordCommunicationCommandHandler : IRequestHandler<RecordCommunicationCommand, Guid>
{
    private readonly IDonorsDbContext _db;

    public RecordCommunicationCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(RecordCommunicationCommand request, CancellationToken ct)
    {
        var donorExists = await _db.Donors.AnyAsync(d => d.Id == request.DonorId, ct);
        if (!donorExists)
            throw new NotFoundException(nameof(Domain.Entities.Donor), request.DonorId);

        var communication = DonorCommunication.Create(
            request.DonorId, request.GrantId, request.Type, request.Subject,
            request.Content, request.CommunicationDate, request.ContactedBy, request.Outcome);

        _db.DonorCommunications.Add(communication);
        await _db.SaveChangesAsync(ct);
        return communication.Id;
    }
}
