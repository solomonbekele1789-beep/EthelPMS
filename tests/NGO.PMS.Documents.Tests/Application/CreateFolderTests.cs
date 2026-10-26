using FluentAssertions;
using FluentValidation;
using NGO.PMS.Documents.Application.Commands.Folders.CreateFolder;
using NGO.PMS.Documents.Tests.Helpers;

namespace NGO.PMS.Documents.Tests.Application;

public class CreateFolderTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesFolder()
    {
        // Arrange
        using var db = DocumentsTestFixture.CreateInMemoryDbContext();
        var currentUser = DocumentsTestFixture.CreateMockCurrentUser();
        var handler = new CreateFolderCommandHandler(db, currentUser);

        var command = new CreateFolderCommand(
            Name: "Finance Documents",
            Description: "All finance-related documents");

        // Act
        var folderId = await handler.Handle(command, CancellationToken.None);

        // Assert
        var folder = await db.DocumentFolders.FindAsync(folderId);
        folder.Should().NotBeNull();
        folder!.Name.Should().Be("Finance Documents");
        folder.Description.Should().Be("All finance-related documents");
    }

    [Fact]
    public void Handle_EmptyName_ThrowsValidationException()
    {
        // Arrange
        var validator = new CreateFolderCommandValidator();
        var command = new CreateFolderCommand(Name: "");

        // Act
        var result = validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public async Task Handle_ReturnsFolderId()
    {
        // Arrange
        using var db = DocumentsTestFixture.CreateInMemoryDbContext();
        var currentUser = DocumentsTestFixture.CreateMockCurrentUser();
        var handler = new CreateFolderCommandHandler(db, currentUser);

        var command = new CreateFolderCommand(Name: "Archive");

        // Act
        var folderId = await handler.Handle(command, CancellationToken.None);

        // Assert
        folderId.Should().NotBeEmpty();
        db.DocumentFolders.Should().ContainSingle(f => f.Id == folderId);
    }
}
