using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Chat.Application.Commands.CreateChatRoom;
using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.Chat.Tests.Helpers;

namespace NGO.PMS.Chat.Tests.Application;

public class CreateChatRoomTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesRoom()
    {
        var userId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        using var db = ChatTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ChatTestFixture.CreateMockCurrentUser(userId: userId, orgId: orgId, fullName: "Test Admin");

        var handler = new CreateChatRoomCommandHandler(db, currentUser);
        var command = new CreateChatRoomCommand(
            Type: ChatRoomType.Group,
            Name: "Project Alpha",
            Description: "Discussion room for Project Alpha");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.ChatRooms.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Project Alpha");
        saved.Type.Should().Be(ChatRoomType.Group);
        saved.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Handle_EmptyName_ForGroupRoom_ThrowsValidationException()
    {
        var validator = new CreateChatRoomCommandValidator();
        var command = new CreateChatRoomCommand(
            Type: ChatRoomType.Group,
            Name: "",
            Description: "No name group");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public async Task Handle_ReturnsRoomId()
    {
        var userId = Guid.NewGuid();
        using var db = ChatTestFixture.CreateInMemoryDbContext();
        var currentUser = ChatTestFixture.CreateMockCurrentUser(userId: userId, fullName: "Creator");

        var handler = new CreateChatRoomCommandHandler(db, currentUser);
        var command = new CreateChatRoomCommand(
            Type: ChatRoomType.Channel,
            Name: "Announcements");

        var roomId = await handler.Handle(command, CancellationToken.None);

        roomId.Should().NotBeEmpty();
        var room = await db.ChatRooms.FindAsync(roomId);
        room.Should().NotBeNull();
        room!.Id.Should().Be(roomId);
    }
}
