using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Participants.Commands.AddHouseholdMember;

public class AddHouseholdMemberCommandHandler : IRequestHandler<AddHouseholdMemberCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddHouseholdMemberCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddHouseholdMemberCommand request, CancellationToken ct)
    {
        var participant = await _db.Participants
            .FirstOrDefaultAsync(p => p.Id == request.ParticipantId, ct)
            ?? throw new NotFoundException("Participant", request.ParticipantId);

        var member = HouseholdMember.Create(
            request.HouseholdCode, request.ParticipantId,
            _currentUser.OrganizationId, request.IsHeadOfHousehold,
            request.RelationshipToHead, request.HouseholdSize);

        _db.HouseholdMembers.Add(member);

        participant.LinkToHousehold(member.Id);

        await _db.SaveChangesAsync(ct);
        return member.Id;
    }
}
