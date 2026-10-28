using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Application.Commands.RecordAttendance;

public class RecordAttendanceCommandHandler : IRequestHandler<RecordAttendanceCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordAttendanceCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RecordAttendanceCommand request, CancellationToken ct)
    {
        var participant = await _db.TrainingParticipants
            .FirstOrDefaultAsync(p => p.Id == request.TrainingParticipantId, ct);

        if (participant is null)
            throw new NotFoundException(nameof(Domain.Entities.TrainingParticipant), request.TrainingParticipantId);

        if (request.Status == AttendanceStatus.Attended)
            participant.MarkAttended();
        else if (request.Status == AttendanceStatus.Absent)
            participant.MarkAbsent();

        await _db.SaveChangesAsync(ct);
        return participant.Id;
    }
}
