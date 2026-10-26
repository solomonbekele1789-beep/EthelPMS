using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Individual assessment of a participant against a graduation benchmark.
/// Score is 0-100 percentage. Pillar stage auto-computed per REQ-GRAD-002.
/// </summary>
public class GraduationAssessment : AuditableEntity
{
    public Guid ParticipantId { get; private set; }
    public Guid BenchmarkId { get; private set; }
    public decimal Score { get; private set; }
    public PillarStage PillarStage { get; private set; }
    public DateTimeOffset AssessmentDate { get; private set; }
    public Guid AssessedByUserId { get; private set; }
    public string? Notes { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Participant? Participant { get; private set; }
    public GraduationBenchmark? Benchmark { get; private set; }

    public static GraduationAssessment Create(
        Guid participantId, Guid benchmarkId, decimal score,
        Guid assessedByUserId, Guid orgId,
        decimal thresholdP2, decimal thresholdP3, decimal thresholdP4,
        string? notes = null)
    {
        if (score < 0 || score > 100)
            throw new ArgumentException("Score must be between 0 and 100.", nameof(score));

        var stage = ComputePillarStage(score, thresholdP2, thresholdP3, thresholdP4);

        var assessment = new GraduationAssessment
        {
            ParticipantId = participantId,
            BenchmarkId = benchmarkId,
            Score = score,
            PillarStage = stage,
            AssessmentDate = DateTimeOffset.UtcNow,
            AssessedByUserId = assessedByUserId,
            Notes = notes,
            OrganizationId = orgId
        };
        assessment.AddDomainEvent(new GraduationAssessmentRecordedEvent(
            assessment.Id, participantId, benchmarkId, score));
        return assessment;
    }

    /// <summary>
    /// Compute pillar stage from score per REQ-GRAD-002:
    /// >=80% = P4, >=50% = P3, >=25% = P2, below = P1.
    /// </summary>
    public static PillarStage ComputePillarStage(
        decimal score, decimal thresholdP2, decimal thresholdP3, decimal thresholdP4)
    {
        if (score >= thresholdP4) return PillarStage.P4;
        if (score >= thresholdP3) return PillarStage.P3;
        if (score >= thresholdP2) return PillarStage.P2;
        return PillarStage.P1;
    }

    public void UpdateScore(decimal score,
        decimal thresholdP2, decimal thresholdP3, decimal thresholdP4,
        string? notes)
    {
        if (score < 0 || score > 100)
            throw new ArgumentException("Score must be between 0 and 100.", nameof(score));
        Score = score;
        PillarStage = ComputePillarStage(score, thresholdP2, thresholdP3, thresholdP4);
        Notes = notes;
    }
}
