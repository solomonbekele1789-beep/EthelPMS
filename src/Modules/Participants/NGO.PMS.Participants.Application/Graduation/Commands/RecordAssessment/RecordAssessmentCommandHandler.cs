using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Graduation.Commands.RecordAssessment;

public class RecordAssessmentCommandHandler : IRequestHandler<RecordAssessmentCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordAssessmentCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RecordAssessmentCommand request, CancellationToken ct)
    {
        var benchmark = await _db.GraduationBenchmarks
            .FirstOrDefaultAsync(b => b.Id == request.BenchmarkId, ct)
            ?? throw new NotFoundException("GraduationBenchmark", request.BenchmarkId);

        var assessment = GraduationAssessment.Create(
            request.ParticipantId, request.BenchmarkId, request.Score,
            _currentUser.UserId, _currentUser.OrganizationId,
            benchmark.ThresholdP2, benchmark.ThresholdP3, benchmark.ThresholdP4,
            request.Notes);

        _db.GraduationAssessments.Add(assessment);
        await _db.SaveChangesAsync(ct);
        return assessment.Id;
    }
}
