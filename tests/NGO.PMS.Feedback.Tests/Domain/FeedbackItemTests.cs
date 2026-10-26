using System.Reflection;
using FluentAssertions;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.Feedback.Domain.Enums;
using NGO.PMS.Feedback.Domain.Events;

namespace NGO.PMS.Feedback.Tests.Domain;

public class FeedbackItemTests
{
    [Fact]
    public void Create_Normal_RaisesSubmittedEvent()
    {
        // Arrange & Act
        var item = FeedbackItem.Create(
            referenceNumber: "ETHEL-F-000001",
            type: FeedbackType.Complaint,
            priority: FeedbackPriority.Normal,
            channel: FeedbackChannel.Web,
            description: "Service was delayed",
            submitterName: "Jane Doe",
            submitterContact: "jane@example.com",
            submitterUserId: Guid.NewGuid(),
            isAnonymous: false,
            isConfidential: false,
            location: "Addis Ababa",
            projectId: null,
            feedbackCategoryId: null,
            slaResponseDays: 5,
            slaResolutionDays: 30);

        // Assert
        item.Should().NotBeNull();
        item.Status.Should().Be(FeedbackStatus.New);
        item.Priority.Should().Be(FeedbackPriority.Normal);
        item.IsConfidential.Should().BeFalse();
        item.Description.Should().Be("Service was delayed");

        item.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<FeedbackSubmittedEvent>()
            .Which.Should().Match<FeedbackSubmittedEvent>(e =>
                e.FeedbackItemId == item.Id &&
                e.Type == FeedbackType.Complaint &&
                e.IsAnonymous == false);
    }

    [Fact]
    public void Create_Safeguarding_AutoEscalates()
    {
        // Arrange & Act
        var item = FeedbackItem.Create(
            referenceNumber: "ETHEL-F-000002",
            type: FeedbackType.Safeguarding,
            priority: FeedbackPriority.Normal,
            channel: FeedbackChannel.InPerson,
            description: "Child safety concern reported",
            submitterName: null,
            submitterContact: null,
            submitterUserId: null,
            isAnonymous: true,
            isConfidential: false,
            location: "Field Office",
            projectId: null,
            feedbackCategoryId: null,
            slaResponseDays: 1,
            slaResolutionDays: 7);

        // Assert — auto-escalation overrides
        item.Priority.Should().Be(FeedbackPriority.Critical);
        item.IsConfidential.Should().BeTrue();
        item.Status.Should().Be(FeedbackStatus.Escalated);

        // Should have both EscalatedEvent and SubmittedEvent
        item.DomainEvents.Should().HaveCount(2);
        item.DomainEvents.Should().ContainSingle(e => e is FeedbackEscalatedEvent);
        item.DomainEvents.Should().ContainSingle(e => e is FeedbackSubmittedEvent);

        var escalatedEvent = item.DomainEvents.OfType<FeedbackEscalatedEvent>().Single();
        escalatedEvent.Reason.Should().Contain("Safeguarding");
    }

    [Fact]
    public void Acknowledge_SetsStatusAndTimestamp()
    {
        // Arrange
        var item = CreateDefaultItem();

        // Act
        item.Acknowledge();

        // Assert
        item.Status.Should().Be(FeedbackStatus.Acknowledged);
        item.AcknowledgedAt.Should().NotBeNull();
        item.AcknowledgedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Resolve_WithResponses_RaisesResolvedEvent()
    {
        // Arrange
        var item = CreateDefaultItem();

        // Add a response via reflection (backing field is private)
        var responsesField = typeof(FeedbackItem)
            .GetField("_responses", BindingFlags.NonPublic | BindingFlags.Instance)!;
        var responses = (List<FeedbackResponse>)responsesField.GetValue(item)!;
        responses.Add(FeedbackResponse.Create(
            feedbackItemId: item.Id,
            responderUserId: Guid.NewGuid(),
            responderName: "Staff Member",
            content: "We have investigated your concern.",
            isInternal: false));

        item.ClearDomainEvents(); // clear the SubmittedEvent from Create

        // Act
        item.Resolve();

        // Assert
        item.Status.Should().Be(FeedbackStatus.Resolved);
        item.ResolvedAt.Should().NotBeNull();

        item.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<FeedbackResolvedEvent>()
            .Which.FeedbackItemId.Should().Be(item.Id);
    }

    [Fact]
    public void Resolve_WithoutResponses_ThrowsInvalidOperationException()
    {
        // Arrange
        var item = CreateDefaultItem();

        // Act
        var act = () => item.Resolve();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*without at least one response*");
    }

    [Fact]
    public void ComputeSlaStatus_Breached_WhenPastDeadline()
    {
        // Arrange — use negative SLA days to force deadline into the past
        var item = FeedbackItem.Create(
            referenceNumber: "ETHEL-F-000099",
            type: FeedbackType.Complaint,
            priority: FeedbackPriority.High,
            channel: FeedbackChannel.Phone,
            description: "Overdue feedback",
            submitterName: "Tester",
            submitterContact: null,
            submitterUserId: null,
            isAnonymous: false,
            isConfidential: false,
            location: null,
            projectId: null,
            feedbackCategoryId: null,
            slaResponseDays: -1,
            slaResolutionDays: -1);

        // Act
        var slaStatus = item.ComputeSlaStatus();

        // Assert
        slaStatus.Should().Be("Breached");
    }

    private static FeedbackItem CreateDefaultItem()
    {
        return FeedbackItem.Create(
            referenceNumber: "ETHEL-F-000001",
            type: FeedbackType.Suggestion,
            priority: FeedbackPriority.Low,
            channel: FeedbackChannel.Web,
            description: "A suggestion for improvement",
            submitterName: "Test User",
            submitterContact: "test@example.com",
            submitterUserId: Guid.NewGuid(),
            isAnonymous: false,
            isConfidential: false,
            location: null,
            projectId: null,
            feedbackCategoryId: null,
            slaResponseDays: 5,
            slaResolutionDays: 30);
    }
}
