using FluentAssertions;
using FluentValidation;
using NGO.PMS.Feedback.Application.Commands.SubmitFeedback;
using NGO.PMS.Feedback.Domain.Enums;
using NGO.PMS.Feedback.Tests.Helpers;

namespace NGO.PMS.Feedback.Tests.Application;

public class SubmitFeedbackTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesFeedbackItem()
    {
        // Arrange
        using var db = FeedbackTestFixture.CreateInMemoryDbContext();
        var currentUser = FeedbackTestFixture.CreateMockCurrentUser();
        var handler = new SubmitFeedbackCommandHandler(db, currentUser);

        var command = new SubmitFeedbackCommand(
            FeedbackCategoryId: null,
            Type: FeedbackType.Suggestion,
            Priority: FeedbackPriority.Normal,
            Channel: FeedbackChannel.Web,
            Description: "Improve the registration process",
            SubmitterName: "Test User",
            SubmitterContact: "test@example.com",
            IsAnonymous: false,
            IsConfidential: false,
            Location: "Head Office",
            ProjectId: null);

        // Act
        var itemId = await handler.Handle(command, CancellationToken.None);

        // Assert
        var item = await db.FeedbackItems.FindAsync(itemId);
        item.Should().NotBeNull();
        item!.Description.Should().Be("Improve the registration process");
        item.Type.Should().Be(FeedbackType.Suggestion);
        item.Status.Should().Be(FeedbackStatus.New);
        item.ReferenceNumber.Should().StartWith("ETHEL-F-");
    }

    [Fact]
    public void Handle_EmptyDescription_ThrowsValidationException()
    {
        // Arrange
        var validator = new SubmitFeedbackCommandValidator();
        var command = new SubmitFeedbackCommand(
            FeedbackCategoryId: null,
            Type: FeedbackType.Complaint,
            Priority: FeedbackPriority.Normal,
            Channel: FeedbackChannel.Web,
            Description: "",
            SubmitterName: null,
            SubmitterContact: null,
            IsAnonymous: true,
            IsConfidential: false,
            Location: null,
            ProjectId: null);

        // Act
        var result = validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description");
    }

    [Fact]
    public async Task Handle_ReturnsNewItemId()
    {
        // Arrange
        using var db = FeedbackTestFixture.CreateInMemoryDbContext();
        var currentUser = FeedbackTestFixture.CreateMockCurrentUser();
        var handler = new SubmitFeedbackCommandHandler(db, currentUser);

        var command = new SubmitFeedbackCommand(
            FeedbackCategoryId: null,
            Type: FeedbackType.Positive,
            Priority: FeedbackPriority.Low,
            Channel: FeedbackChannel.Mobile,
            Description: "Great service, thank you!",
            SubmitterName: "Happy User",
            SubmitterContact: null,
            IsAnonymous: false,
            IsConfidential: false,
            Location: null,
            ProjectId: null);

        // Act
        var itemId = await handler.Handle(command, CancellationToken.None);

        // Assert
        itemId.Should().NotBeEmpty();
        db.FeedbackItems.Should().ContainSingle(f => f.Id == itemId);
    }
}
