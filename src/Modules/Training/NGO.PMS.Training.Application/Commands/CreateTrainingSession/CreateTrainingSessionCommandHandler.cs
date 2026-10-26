using MediatR;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingSession;

public class CreateTrainingSessionCommandHandler : IRequestHandler<CreateTrainingSessionCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTrainingSessionCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateTrainingSessionCommand request, CancellationToken ct)
    {
        var session = TrainingSession.Create(
            request.TrainingProgramId, request.Title, request.ScheduledDate,
            request.Venue, request.EndDate, request.MaxParticipants, request.Notes);

        _db.TrainingSessions.Add(session);
        await _db.SaveChangesAsync(ct);
        return session.Id;
    }
}
