using FluentAssertions;
using NGO.PMS.Documents.Domain.Entities;

namespace NGO.PMS.Documents.Tests.Domain;

public class DocumentFolderTests
{
    private const string TenantId = "tenant-001";

    [Fact]
    public void Create_ValidInput_ReturnsFolder()
    {
        // Arrange
        var parentId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // Act
        var folder = DocumentFolder.Create(
            name: "Project Documents",
            tenantId: TenantId,
            parentFolderId: parentId,
            description: "Folder for project docs",
            projectId: projectId,
            sortOrder: 1);

        // Assert
        folder.Should().NotBeNull();
        folder.Id.Should().NotBeEmpty();
        folder.Name.Should().Be("Project Documents");
        folder.ParentFolderId.Should().Be(parentId);
        folder.Description.Should().Be("Folder for project docs");
        folder.ProjectId.Should().Be(projectId);
        folder.SortOrder.Should().Be(1);
    }

    [Fact]
    public void Create_EmptyName_ThrowsArgumentException()
    {
        // Arrange & Act
        var act = () => DocumentFolder.Create(
            name: "",
            tenantId: TenantId);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void MoveTo_ChangesParentId()
    {
        // Arrange
        var folder = DocumentFolder.Create("Reports", TenantId);
        var newParentId = Guid.NewGuid();

        // Act
        folder.MoveTo(newParentId);

        // Assert
        folder.ParentFolderId.Should().Be(newParentId);
    }
}
