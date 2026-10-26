using MediatR;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Application.Participants.Commands.EnrollParticipant;

public class EnrollParticipantCommandHandler : IRequestHandler<EnrollParticipantCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public EnrollParticipantCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(EnrollParticipantCommand request, CancellationToken ct)
    {
        var enrollment = ParticipantEnrollment.Create(
            request.ParticipantId, request.ProjectId,
            _currentUser.OrganizationId, request.CohortName);

        _db.ParticipantEnrollments.Add(enrollment);
        await _db.SaveChangesAsync(ct);
        return enrollment.Id;
    }
}
