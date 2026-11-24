using FluentAssertions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.Documents.Domain.Enums;
using NGO.PMS.Documents.Domain.Events;

namespace NGO.PMS.Documents.Tests.Domain;

public class DocumentTests
{
    private static readonly Guid TenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    [Fact]
    public void Create_ValidInput_ReturnsDocumentAndRaisesEvent()
    {
        // Arrange & Act
        var doc = Document.Create(
            fileName: "report.pdf",
            contentType: "application/pdf",
            fileSizeBytes: 1024,
            tenantId: TenantId,
            displayName: "Annual Report",
            description: "2025 annual report",
            category: DocumentCategory.Report);

        // Assert
        doc.Should().NotBeNull();
        doc.Id.Should().NotBeEmpty();
        doc.FileName.Should().Be("report.pdf");
        doc.ContentType.Should().Be("application/pdf");
        doc.FileSizeBytes.Should().Be(1024);
        doc.DisplayName.Should().Be("Annual Report");
        doc.Description.Should().Be("2025 annual report");
        doc.Category.Should().Be(DocumentCategory.Report);
        doc.Status.Should().Be(DocumentStatus.Draft);
        doc.CurrentVersion.Should().Be(1);

        doc.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<DocumentUploadedEvent>()
            .Which.Should().Match<DocumentUploadedEvent>(e =>
                e.DocumentId == doc.Id &&
                e.FileName == "report.pdf" &&
                e.Version == 1);
    }

    [Fact]
    public void Publish_ChangesStatusToPublished()
    {
        // Arrange
        var doc = Document.Create("file.pdf", "application/pdf", 512, TenantId);

        // Act
        doc.Publish();

        // Assert
        doc.Status.Should().Be(DocumentStatus.Published);
    }

    [Fact]
    public void Archive_ChangesStatusToArchived()
    {
        // Arrange
        var doc = Document.Create("file.pdf", "application/pdf", 512, TenantId);

        // Act
        doc.Archive();

        // Assert
        doc.Status.Should().Be(DocumentStatus.Archived);
    }

    [Fact]
    public void IncrementVersion_IncrementsCurrentVersion()
    {
        // Arrange
        var doc = Document.Create("file.pdf", "application/pdf", 512, TenantId);
        doc.CurrentVersion.Should().Be(1);

        // Act
        doc.IncrementVersion(fileSizeBytes: 2048, contentType: "application/pdf");

        // Assert
        doc.CurrentVersion.Should().Be(2);
        doc.FileSizeBytes.Should().Be(2048);
    }

    [Fact]
    public void UpdateMetadata_ChangesProperties()
    {
        // Arrange
        var doc = Document.Create("file.pdf", "application/pdf", 512, TenantId);
        var linkedEntityId = Guid.NewGuid();

        // Act
        doc.UpdateMetadata(
            displayName: "Updated Name",
            description: "Updated description",
            category: DocumentCategory.Policy,
            tags: "policy,governance",
            linkedEntityId: linkedEntityId,
            linkedEntityType: "Project");

        // Assert
        doc.DisplayName.Should().Be("Updated Name");
        doc.Description.Should().Be("Updated description");
        doc.Category.Should().Be(DocumentCategory.Policy);
        doc.Tags.Should().Be("policy,governance");
        doc.LinkedEntityId.Should().Be(linkedEntityId);
        doc.LinkedEntityType.Should().Be("Project");
    }
}
