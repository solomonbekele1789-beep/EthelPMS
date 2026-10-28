using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Application.Participants.Commands.RegisterParticipant;

public class RegisterParticipantCommandHandler : IRequestHandler<RegisterParticipantCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RegisterParticipantCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RegisterParticipantCommand request, CancellationToken ct)
    {
        var sequenceNumber = await _db.Participants.CountAsync(ct) + 1;
        var code = $"ETHEL-P-{sequenceNumber:D6}";

        var participant = Participant.Create(
            request.FirstName, request.LastName, request.Gender, code,
            _currentUser.OrganizationId, request.MiddleName, request.DateOfBirth,
            request.IdNumber, request.Phone);

        _db.Participants.Add(participant);
        await _db.SaveChangesAsync(ct);
        return participant.Id;
    }
}
