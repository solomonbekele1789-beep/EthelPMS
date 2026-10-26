using FluentAssertions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.Training.Domain.Events;

namespace NGO.PMS.Training.Tests.Domain;

public class TrainingParticipantTests
{
    private readonly Guid _sessionId = Guid.NewGuid();

    [Fact]
    public void Create_ValidInput_ReturnsParticipant()
    {
        var participantId = Guid.NewGuid();

        var participant = TrainingParticipant.Create(
            _sessionId, "Jane Doe", participantId);

        participant.TrainingSessionId.Should().Be(_sessionId);
        participant.FullName.Should().Be("Jane Doe");
        participant.ParticipantId.Should().Be(participantId);
        participant.Status.Should().Be(AttendanceStatus.Registered);
        participant.AttendedAt.Should().BeNull();
        participant.PreTestScore.Should().BeNull();
        participant.PostTestScore.Should().BeNull();
        participant.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void MarkAttended_SetsStatusAndRaisesEvent()
    {
        var participantId = Guid.NewGuid();
        var participant = TrainingParticipant.Create(
            _sessionId, "Jane Doe", participantId);

        participant.MarkAttended();

        participant.Status.Should().Be(AttendanceStatus.Attended);
        participant.AttendedAt.Should().NotBeNull();
        participant.AttendedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        participant.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<TrainingAttendanceRecordedEvent>();
    }

    [Fact]
    public void MarkAbsent_SetsAbsentStatus()
    {
        var participant = TrainingParticipant.Create(
            _sessionId, "John Smith", Guid.NewGuid());

        participant.MarkAbsent();

        participant.Status.Should().Be(AttendanceStatus.Absent);
        participant.AttendedAt.Should().BeNull();
    }

    [Fact]
    public void RecordScores_ValidScores_UpdatesScores()
    {
        var participant = TrainingParticipant.Create(
            _sessionId, "Jane Doe", Guid.NewGuid());

        participant.RecordScores(preTestScore: 65.5m, postTestScore: 88.0m);

        participant.PreTestScore.Should().Be(65.5m);
        participant.PostTestScore.Should().Be(88.0m);
    }
}
