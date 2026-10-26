using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Application.Graduation.Commands.CreateGraduationDecision;

public class CreateGraduationDecisionCommandHandler : IRequestHandler<CreateGraduationDecisionCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateGraduationDecisionCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateGraduationDecisionCommand request, CancellationToken ct)
    {
        var orgId = _currentUser.OrganizationId;

        // Get all required benchmarks (optionally filtered by project)
        var requiredBenchmarks = await _db.GraduationBenchmarks
            .Where(b => b.RequiredForGraduation && b.IsActive && b.OrganizationId == orgId)
            .Where(b => b.ProjectId == null || b.ProjectId == request.ProjectId)
            .ToListAsync(ct);

        var totalRequired = requiredBenchmarks.Count;
        var p4Count = 0;

        if (totalRequired > 0)
        {
            var benchmarkIds = requiredBenchmarks.Select(b => b.Id).ToList();

            // Get the latest assessment per benchmark for this participant
            var latestAssessments = await _db.GraduationAssessments
                .Where(a => a.ParticipantId == request.ParticipantId
                         && benchmarkIds.Contains(a.BenchmarkId))
                .GroupBy(a => a.BenchmarkId)
                .Select(g => g.OrderByDescending(a => a.AssessmentDate).First())
                .ToListAsync(ct);

            p4Count = latestAssessments.Count(a => a.PillarStage == PillarStage.P4);
        }

        var requiredMetPct = totalRequired > 0
            ? (decimal)p4Count / totalRequired * 100m
            : 0m;

        var decision = GraduationDecision.Create(
            request.ParticipantId, request.ProjectId, orgId,
            requiredMetPct, request.Notes);

        _db.GraduationDecisions.Add(decision);
        await _db.SaveChangesAsync(ct);
        return decision.Id;
    }
}
