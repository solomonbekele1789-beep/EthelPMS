using FluentAssertions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.Training.Domain.Events;

namespace NGO.PMS.Training.Tests.Domain;

public class TrainingSessionTests
{
    private readonly Guid _programId = Guid.NewGuid();

    private TrainingSession CreateDefaultSession()
    {
        return TrainingSession.Create(
            _programId,
            "First Aid Training",
            DateTime.UtcNow.AddDays(7),
            venue: "Conference Room A");
    }

    [Fact]
    public void Create_ValidInput_ReturnsSession()
    {
        var scheduledDate = DateTime.UtcNow.AddDays(14);

        var session = TrainingSession.Create(
            _programId,
            "Agricultural Best Practices",
            scheduledDate,
            venue: "Field Office",
            maxParticipants: 30,
            notes: "Bring notebooks");

        session.TrainingProgramId.Should().Be(_programId);
        session.Title.Should().Be("Agricultural Best Practices");
        session.ScheduledDate.Should().Be(scheduledDate);
        session.Venue.Should().Be("Field Office");
        session.MaxParticipants.Should().Be(30);
        session.Notes.Should().Be("Bring notebooks");
        session.Status.Should().Be(TrainingStatus.Draft);
        session.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Schedule_FromDraft_UpdatesStatus()
    {
        var session = CreateDefaultSession();
        session.Status.Should().Be(TrainingStatus.Draft);

        session.Schedule();

        session.Status.Should().Be(TrainingStatus.Scheduled);
    }

    [Fact]
    public void Start_FromScheduled_UpdatesStatus()
    {
        var session = CreateDefaultSession();
        session.Schedule();
        session.Status.Should().Be(TrainingStatus.Scheduled);

        session.Start();

        session.Status.Should().Be(TrainingStatus.InProgress);
    }

    [Fact]
    public void Complete_FromInProgress_SetsCompletedAndRaisesEvent()
    {
        var session = CreateDefaultSession();
        session.Schedule();
        session.Start();
        session.Status.Should().Be(TrainingStatus.InProgress);

        session.Complete();

        session.Status.Should().Be(TrainingStatus.Completed);
        session.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<TrainingSessionCompletedEvent>();
    }

    [Fact]
    public void Cancel_CompletedSession_ThrowsInvalidOperationException()
    {
        var session = CreateDefaultSession();
        session.Schedule();
        session.Start();
        session.Complete();
        session.Status.Should().Be(TrainingStatus.Completed);

        var act = () => session.Cancel();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*completed*");
    }
}
