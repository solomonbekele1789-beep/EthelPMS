using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Participants.Commands.UpdateParticipantAddress;

public class UpdateParticipantAddressCommandHandler : IRequestHandler<UpdateParticipantAddressCommand>
{
    private readonly IParticipantsDbContext _db;

    public UpdateParticipantAddressCommandHandler(IParticipantsDbContext db) => _db = db;

    public async Task Handle(UpdateParticipantAddressCommand request, CancellationToken ct)
    {
        var participant = await _db.Participants
            .FirstOrDefaultAsync(p => p.Id == request.ParticipantId, ct)
            ?? throw new NotFoundException("Participant", request.ParticipantId);

        participant.UpdateAddress(request.Region, request.Zone, request.Woreda,
            request.Kebele, request.Address);

        await _db.SaveChangesAsync(ct);
    }
}
