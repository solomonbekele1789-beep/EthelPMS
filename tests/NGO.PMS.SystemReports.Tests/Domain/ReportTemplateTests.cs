using FluentAssertions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SystemReports.Domain.Enums;

namespace NGO.PMS.SystemReports.Tests.Domain;

public class ReportTemplateTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Should_Create_ReportTemplate()
    {
        var template = ReportTemplate.Create(
            "Monthly Donor Report", "Donors", ReportFormat.PDF,
            "SELECT * FROM donors", _orgId,
            description: "Monthly summary", templateContent: "<h1>Report</h1>",
            isSystemTemplate: false);

        template.Should().NotBeNull();
        template.Id.Should().NotBeEmpty();
        template.Name.Should().Be("Monthly Donor Report");
        template.Module.Should().Be("Donors");
        template.ReportFormat.Should().Be(ReportFormat.PDF);
        template.QueryDefinition.Should().Be("SELECT * FROM donors");
        template.Description.Should().Be("Monthly summary");
        template.TemplateContent.Should().Be("<h1>Report</h1>");
        template.IsSystemTemplate.Should().BeFalse();
        template.IsActive.Should().BeTrue();
        template.OrganizationId.Should().Be(_orgId);
        template.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public void Should_Update_Template()
    {
        var template = ReportTemplate.Create(
            "Original", "Donors", ReportFormat.Excel,
            "SELECT 1", _orgId);

        template.Update("Updated Name", "New description",
            "SELECT * FROM updated", "<new/>", isActive: true);

        template.Name.Should().Be("Updated Name");
        template.Description.Should().Be("New description");
        template.QueryDefinition.Should().Be("SELECT * FROM updated");
        template.TemplateContent.Should().Be("<new/>");
        template.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Should_Deactivate_Template()
    {
        var template = ReportTemplate.Create(
            "Active Template", "Projects", ReportFormat.CSV,
            "SELECT 1", _orgId);
        template.IsActive.Should().BeTrue();

        template.Deactivate();

        template.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Should_Track_Module_And_Format()
    {
        var template = ReportTemplate.Create(
            "Finance Report", "FundAccounting", ReportFormat.Word,
            "SELECT * FROM accounts", _orgId,
            isSystemTemplate: true);

        template.Module.Should().Be("FundAccounting");
        template.ReportFormat.Should().Be(ReportFormat.Word);
        template.IsSystemTemplate.Should().BeTrue();
    }
}
