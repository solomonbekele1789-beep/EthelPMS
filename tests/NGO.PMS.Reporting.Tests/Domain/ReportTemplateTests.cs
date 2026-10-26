using FluentAssertions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Tests.Domain;

public class ReportTemplateTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldSetNameAndType()
    {
        var template = ReportTemplate.Create("Monthly Template", ReportType.Monthly, _orgId);

        template.Name.Should().Be("Monthly Template");
        template.ReportType.Should().Be(ReportType.Monthly);
        template.IsActive.Should().BeTrue();
        template.RequiredApprovalLevels.Should().Be(1);
        template.SubmissionDeadlineDays.Should().Be(7);
    }

    [Fact]
    public void Create_ShouldThrow_WhenNameEmpty()
    {
        var act = () => ReportTemplate.Create("", ReportType.Monthly, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*name*");
    }

    [Fact]
    public void Create_ShouldThrow_WhenZeroApprovalLevels()
    {
        var act = () => ReportTemplate.Create("Test", ReportType.Monthly, _orgId, requiredApprovalLevels: 0);
        act.Should().Throw<ArgumentException>().WithMessage("*approval*");
    }

    [Fact]
    public void AddSection_ShouldCreateAndAddSection()
    {
        var template = ReportTemplate.Create("Template", ReportType.Quarterly, _orgId);

        var section = template.AddSection("Executive Summary", SectionType.Narrative, 1, true, "Provide overview");

        template.Sections.Should().ContainSingle();
        section.Title.Should().Be("Executive Summary");
        section.SectionType.Should().Be(SectionType.Narrative);
        section.IsRequired.Should().BeTrue();
        section.Instructions.Should().Be("Provide overview");
    }

    [Fact]
    public void Update_ShouldModifyProperties()
    {
        var template = ReportTemplate.Create("Old", ReportType.Monthly, _orgId);

        template.Update("New Name", "New desc", 2, 14);

        template.Name.Should().Be("New Name");
        template.Description.Should().Be("New desc");
        template.RequiredApprovalLevels.Should().Be(2);
        template.SubmissionDeadlineDays.Should().Be(14);
    }

    [Fact]
    public void Deactivate_ShouldSetInactive()
    {
        var template = ReportTemplate.Create("Active", ReportType.Monthly, _orgId);

        template.Deactivate();
        template.IsActive.Should().BeFalse();

        template.Activate();
        template.IsActive.Should().BeTrue();
    }
}
