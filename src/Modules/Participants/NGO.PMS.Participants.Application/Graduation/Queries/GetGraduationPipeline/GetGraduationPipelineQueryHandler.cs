using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;
using NGO.PMS.Participants.Domain.Enums;

namespace NGO.PMS.Participants.Application.Graduation.Queries.GetGraduationPipeline;

public class GetGraduationPipelineQueryHandler
    : IRequestHandler<GetGraduationPipelineQuery, GraduationPipelineDto>
{
    private readonly IParticipantsDbContext _db;

    public GetGraduationPipelineQueryHandler(IParticipantsDbContext db)
    {
        _db = db;
    }

    public async Task<GraduationPipelineDto> Handle(
        GetGraduationPipelineQuery request, CancellationToken cancellationToken)
    {
        // Get all participant IDs enrolled in this project
        var enrolledParticipantIds = await _db.ParticipantEnrollments
            .Where(e => e.ProjectId == request.ProjectId)
            .Select(e => e.ParticipantId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var totalParticipants = enrolledParticipantIds.Count;

        // Get required benchmarks for this project (project-specific + global)
        var requiredBenchmarkIds = await _db.GraduationBenchmarks
            .Where(b => b.RequiredForGraduation
                        && b.IsActive
                        && (b.ProjectId == request.ProjectId || b.ProjectId == null))
            .Select(b => b.Id)
            .ToListAsync(cancellationToken);

        // For each participant, get their latest assessment per benchmark
        var latestAssessments = await _db.GraduationAssessments
            .Where(a => enrolledParticipantIds.Contains(a.ParticipantId)
                        && requiredBenchmarkIds.Contains(a.BenchmarkId))
            .GroupBy(a => new { a.ParticipantId, a.BenchmarkId })
            .Select(g => new
            {
                g.Key.ParticipantId,
                g.Key.BenchmarkId,
                PillarStage = g.OrderByDescending(a => a.AssessmentDate)
                    .Select(a => a.PillarStage)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        // Compute overall pillar stage per participant as MINIMUM across required benchmarks
        var participantStages = latestAssessments
            .GroupBy(a => a.ParticipantId)
            .Select(g => new
            {
                ParticipantId = g.Key,
                OverallStage = g.Min(a => a.PillarStage)
            })
            .ToList();

        var p1Count = participantStages.Count(p => p.OverallStage == PillarStage.P1);
        var p2Count = participantStages.Count(p => p.OverallStage == PillarStage.P2);
        var p3Count = participantStages.Count(p => p.OverallStage == PillarStage.P3);
        var p4Count = participantStages.Count(p => p.OverallStage == PillarStage.P4);

        // Count participants with no assessments as P1
        var assessedParticipantIds = participantStages.Select(p => p.ParticipantId).ToHashSet();
        var unassessedCount = enrolledParticipantIds.Count(id => !assessedParticipantIds.Contains(id));
        p1Count += unassessedCount;

        // Count graduated participants
        var graduatedCount = await _db.GraduationDecisions
            .Where(d => d.ProjectId == request.ProjectId
                        && d.Status == GraduationDecisionStatus.Approved)
            .Select(d => d.ParticipantId)
            .Distinct()
            .CountAsync(cancellationToken);

        var graduationRate = totalParticipants > 0
            ? (decimal)graduatedCount / totalParticipants * 100
            : 0;

        return new GraduationPipelineDto
        {
            ProjectId = request.ProjectId,
            TotalParticipants = totalParticipants,
            P1Count = p1Count,
            P2Count = p2Count,
            P3Count = p3Count,
            P4Count = p4Count,
            GraduatedCount = graduatedCount,
            GraduationRate = Math.Round(graduationRate, 2)
        };
    }
}
