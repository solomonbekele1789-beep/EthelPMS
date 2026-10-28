using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Participants.Commands.UpdateParticipant;

public class UpdateParticipantCommandHandler : IRequestHandler<UpdateParticipantCommand>
{
    private readonly IParticipantsDbContext _db;

    public UpdateParticipantCommandHandler(IParticipantsDbContext db) => _db = db;

    public async Task Handle(UpdateParticipantCommand request, CancellationToken ct)
    {
        var participant = await _db.Participants
            .FirstOrDefaultAsync(p => p.Id == request.ParticipantId, ct)
            ?? throw new NotFoundException("Participant", request.ParticipantId);

        participant.UpdateProfile(request.FirstName, request.LastName, request.MiddleName,
            request.Gender, request.DateOfBirth, request.Phone, request.Email, request.IdNumber);

        await _db.SaveChangesAsync(ct);
    }
}
