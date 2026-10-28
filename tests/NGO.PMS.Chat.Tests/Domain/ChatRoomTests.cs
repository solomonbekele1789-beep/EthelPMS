using FluentAssertions;
using NGO.PMS.Chat.Domain.Entities;
using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.Chat.Domain.Events;

namespace NGO.PMS.Chat.Tests.Domain;

public class ChatRoomTests
{
    private readonly Guid _creatorId = Guid.NewGuid();

    private ChatRoom CreateGroupRoom()
        => ChatRoom.Create(ChatRoomType.Group, _creatorId, "General", "A group room");

    [Fact]
    public void Create_ValidInput_ReturnsRoomAndRaisesEvent()
    {
        var room = ChatRoom.Create(ChatRoomType.Group, _creatorId, "Dev Team", "Development room");

        room.Should().NotBeNull();
        room.Id.Should().NotBeEmpty();
        room.Name.Should().Be("Dev Team");
        room.Type.Should().Be(ChatRoomType.Group);
        room.Description.Should().Be("Development room");
        room.IsActive.Should().BeTrue();
        room.CreatedByUserId.Should().Be(_creatorId);
        room.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ChatRoomCreatedEvent>()
            .Which.RoomType.Should().Be(ChatRoomType.Group);
    }

    [Fact]
    public void AddParticipant_RaisesParticipantJoinedEvent()
    {
        var room = CreateGroupRoom();
        room.ClearDomainEvents();

        var userId = Guid.NewGuid();
        var participant = room.AddParticipant(userId, "Alice", isAdmin: false);

        participant.Should().NotBeNull();
        participant.UserId.Should().Be(userId);
        participant.DisplayName.Should().Be("Alice");
        participant.IsAdmin.Should().BeFalse();
        room.Participants.Should().ContainSingle();
        room.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ParticipantJoinedEvent>()
            .Which.UserId.Should().Be(userId);
    }

    [Fact]
    public void RemoveParticipant_RemovesFromList()
    {
        var room = CreateGroupRoom();
        var userId = Guid.NewGuid();
        room.AddParticipant(userId, "Bob");

        room.Participants.Should().HaveCount(1);

        room.RemoveParticipant(userId);

        room.Participants.Should().BeEmpty();
    }

    [Fact]
    public void Archive_SetsInactive()
    {
        var room = CreateGroupRoom();
        room.IsActive.Should().BeTrue();

        room.Archive();

        room.IsActive.Should().BeFalse();
    }
}
