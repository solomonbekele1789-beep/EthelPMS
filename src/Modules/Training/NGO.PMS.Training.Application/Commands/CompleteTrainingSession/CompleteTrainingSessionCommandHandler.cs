using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Training.Application.Commands.CompleteTrainingSession;

public class CompleteTrainingSessionCommandHandler : IRequestHandler<CompleteTrainingSessionCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CompleteTrainingSessionCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CompleteTrainingSessionCommand request, CancellationToken ct)
    {
        var session = await _db.TrainingSessions
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, ct);

        if (session is null)
            throw new NotFoundException(nameof(Domain.Entities.TrainingSession), request.SessionId);

        session.Complete();
        await _db.SaveChangesAsync(ct);
        return session.Id;
    }
}
