using FluentAssertions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.ImportExport.Domain.Enums;

namespace NGO.PMS.ImportExport.Tests.Domain;

public class ImportTemplateTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Should_Create_ImportTemplate()
    {
        var template = ImportTemplate.Create(
            _orgId, "Participant Import", "Participants", "Participant",
            ImportFileFormat.CSV, "{\"col1\":\"Name\",\"col2\":\"Age\"}",
            validationRules: "{\"Name\":\"required\"}", isSystemTemplate: false);

        template.Should().NotBeNull();
        template.Id.Should().NotBeEmpty();
        template.OrganizationId.Should().Be(_orgId);
        template.Name.Should().Be("Participant Import");
        template.Module.Should().Be("Participants");
        template.EntityType.Should().Be("Participant");
        template.FileFormat.Should().Be(ImportFileFormat.CSV);
        template.ColumnMappings.Should().Be("{\"col1\":\"Name\",\"col2\":\"Age\"}");
        template.ValidationRules.Should().Be("{\"Name\":\"required\"}");
        template.IsSystemTemplate.Should().BeFalse();
        template.IsActive.Should().BeTrue();
        template.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public void Should_Track_Module_And_EntityType()
    {
        var template = ImportTemplate.Create(
            _orgId, "Donor Import", "Donors", "Donor",
            ImportFileFormat.Excel, "{\"col1\":\"DonorName\"}",
            validationRules: null, isSystemTemplate: true);

        template.Module.Should().Be("Donors");
        template.EntityType.Should().Be("Donor");
        template.FileFormat.Should().Be(ImportFileFormat.Excel);
        template.IsSystemTemplate.Should().BeTrue();
    }

    [Fact]
    public void Should_Soft_Delete()
    {
        var template = ImportTemplate.Create(
            _orgId, "Deletable Template", "Projects", "Project",
            ImportFileFormat.JSON, "{}", validationRules: null,
            isSystemTemplate: false);

        template.IsDeleted.Should().BeFalse();
        template.DeletedAt.Should().BeNull();

        // Simulate soft delete (ISoftDeletable properties are settable)
        template.IsDeleted = true;
        template.DeletedAt = DateTimeOffset.UtcNow;
        template.DeletedBy = "admin@ngo.org";

        template.IsDeleted.Should().BeTrue();
        template.DeletedAt.Should().NotBeNull();
        template.DeletedBy.Should().Be("admin@ngo.org");
    }
}
