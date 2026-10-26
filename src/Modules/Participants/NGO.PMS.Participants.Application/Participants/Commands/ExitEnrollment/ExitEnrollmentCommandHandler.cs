using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Participants.Commands.ExitEnrollment;

public class ExitEnrollmentCommandHandler : IRequestHandler<ExitEnrollmentCommand>
{
    private readonly IParticipantsDbContext _db;

    public ExitEnrollmentCommandHandler(IParticipantsDbContext db) => _db = db;

    public async Task Handle(ExitEnrollmentCommand request, CancellationToken ct)
    {
        var enrollment = await _db.ParticipantEnrollments
            .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId, ct)
            ?? throw new NotFoundException("ParticipantEnrollment", request.EnrollmentId);

        enrollment.Exit(request.Reason);
        await _db.SaveChangesAsync(ct);
    }
}
