using FluentAssertions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;

namespace NGO.PMS.Participants.Tests.Domain;

public class GraduationAssessmentTests
{
    private readonly Guid _participantId = Guid.NewGuid();
    private readonly Guid _benchmarkId = Guid.NewGuid();
    private readonly Guid _assessorId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    // Default thresholds per REQ-GRAD-002: P2=25, P3=50, P4=80
    private const decimal ThresholdP2 = 25m;
    private const decimal ThresholdP3 = 50m;
    private const decimal ThresholdP4 = 80m;

    [Fact]
    public void Create_ValidInput_SetsPropertiesAndPillarStage()
    {
        var assessment = GraduationAssessment.Create(
            _participantId, _benchmarkId, 85m, _assessorId, _orgId,
            ThresholdP2, ThresholdP3, ThresholdP4, "Good progress");

        assessment.ParticipantId.Should().Be(_participantId);
        assessment.BenchmarkId.Should().Be(_benchmarkId);
        assessment.Score.Should().Be(85m);
        assessment.PillarStage.Should().Be(PillarStage.P4);
        assessment.AssessedByUserId.Should().Be(_assessorId);
        assessment.OrganizationId.Should().Be(_orgId);
        assessment.Notes.Should().Be("Good progress");
        assessment.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<GraduationAssessmentRecordedEvent>();
    }

    [Fact]
    public void Create_ScoreBelow25_SetsP1()
    {
        var assessment = GraduationAssessment.Create(
            _participantId, _benchmarkId, 10m, _assessorId, _orgId,
            ThresholdP2, ThresholdP3, ThresholdP4);

        assessment.PillarStage.Should().Be(PillarStage.P1);
    }

    [Fact]
    public void Create_Score50_SetsP3()
    {
        var assessment = GraduationAssessment.Create(
            _participantId, _benchmarkId, 50m, _assessorId, _orgId,
            ThresholdP2, ThresholdP3, ThresholdP4);

        assessment.PillarStage.Should().Be(PillarStage.P3);
    }

    [Fact]
    public void Create_InvalidScore_ThrowsArgumentException()
    {
        var act = () => GraduationAssessment.Create(
            _participantId, _benchmarkId, 101m, _assessorId, _orgId,
            ThresholdP2, ThresholdP3, ThresholdP4);

        act.Should().Throw<ArgumentException>().WithMessage("*Score*");
    }

    [Fact]
    public void ComputePillarStage_ThresholdBoundaries()
    {
        // Exact boundary: score=80 should be P4
        GraduationAssessment.ComputePillarStage(80m, ThresholdP2, ThresholdP3, ThresholdP4)
            .Should().Be(PillarStage.P4);

        // Just below boundary: 79.99 should be P3
        GraduationAssessment.ComputePillarStage(79.99m, ThresholdP2, ThresholdP3, ThresholdP4)
            .Should().Be(PillarStage.P3);
    }
}
