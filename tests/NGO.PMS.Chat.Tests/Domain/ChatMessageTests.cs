using FluentAssertions;
using NGO.PMS.Chat.Domain.Entities;
using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.Chat.Domain.Events;

namespace NGO.PMS.Chat.Tests.Domain;

public class ChatMessageTests
{
    private readonly Guid _roomId = Guid.NewGuid();
    private readonly Guid _senderId = Guid.NewGuid();

    private ChatMessage CreateMessage(string content = "Hello world")
        => ChatMessage.Create(_roomId, _senderId, "Alice", content);

    [Fact]
    public void Create_ValidInput_ReturnsMessageAndRaisesEvent()
    {
        var message = ChatMessage.Create(_roomId, _senderId, "Alice", "Hello!");

        message.Should().NotBeNull();
        message.Id.Should().NotBeEmpty();
        message.ChatRoomId.Should().Be(_roomId);
        message.SenderUserId.Should().Be(_senderId);
        message.SenderDisplayName.Should().Be("Alice");
        message.Content.Should().Be("Hello!");
        message.Status.Should().Be(MessageStatus.Sent);
        message.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<MessageSentEvent>()
            .Which.SenderUserId.Should().Be(_senderId);
    }

    [Fact]
    public void Edit_BySender_UpdatesContentAndEditedAt()
    {
        var message = CreateMessage();
        message.EditedAt.Should().BeNull();

        message.Edit("Updated content", _senderId);

        message.Content.Should().Be("Updated content");
        message.EditedAt.Should().NotBeNull();
        message.EditedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Edit_ByNonSender_ThrowsInvalidOperationException()
    {
        var message = CreateMessage();
        var otherUserId = Guid.NewGuid();

        var act = () => message.Edit("Hacked!", otherUserId);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddReaction_AppendsEmoji()
    {
        var message = CreateMessage();
        message.Reaction.Should().BeNull();

        message.AddReaction("thumbsup");

        message.Reaction.Should().Contain("thumbsup");

        message.AddReaction("heart");

        message.Reaction.Should().Contain("thumbsup");
        message.Reaction.Should().Contain("heart");
    }
}
