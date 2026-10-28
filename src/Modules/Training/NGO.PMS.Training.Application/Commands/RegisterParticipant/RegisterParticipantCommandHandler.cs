using MediatR;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Application.Commands.RegisterParticipant;

public class RegisterParticipantCommandHandler : IRequestHandler<RegisterParticipantCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RegisterParticipantCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RegisterParticipantCommand request, CancellationToken ct)
    {
        var participant = TrainingParticipant.Create(
            request.TrainingSessionId, request.FullName, request.ParticipantId);

        _db.TrainingParticipants.Add(participant);
        await _db.SaveChangesAsync(ct);
        return participant.Id;
    }
}
