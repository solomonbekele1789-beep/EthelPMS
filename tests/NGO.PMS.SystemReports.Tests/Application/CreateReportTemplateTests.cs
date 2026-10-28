using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.SystemReports.Application.ReportTemplates.Commands.CreateReportTemplate;
using NGO.PMS.SystemReports.Domain.Enums;
using NGO.PMS.SystemReports.Tests.Helpers;

namespace NGO.PMS.SystemReports.Tests.Application;

public class CreateReportTemplateTests
{
    [Fact]
    public async Task Should_Create_Valid_Template()
    {
        var userId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        using var db = SystemReportsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = SystemReportsTestFixture.CreateMockCurrentUser(userId: userId, orgId: orgId);

        var handler = new CreateReportTemplateCommandHandler(db, currentUser);
        var command = new CreateReportTemplateCommand(
            Name: "Quarterly Report",
            Description: "Quarterly financial summary",
            Module: "FundAccounting",
            ReportFormat: ReportFormat.PDF,
            QueryDefinition: "SELECT * FROM transactions WHERE quarter = @q",
            TemplateContent: "<report/>",
            IsSystemTemplate: false);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.ReportTemplates.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Quarterly Report");
        saved.Module.Should().Be("FundAccounting");
        saved.ReportFormat.Should().Be(ReportFormat.PDF);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Should_Fail_Without_Name()
    {
        var validator = new CreateReportTemplateCommandValidator();
        var command = new CreateReportTemplateCommand(
            Name: "",
            Description: null,
            Module: "Projects",
            ReportFormat: ReportFormat.Excel,
            QueryDefinition: "SELECT 1",
            TemplateContent: null,
            IsSystemTemplate: false);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_Without_Module()
    {
        var validator = new CreateReportTemplateCommandValidator();
        var command = new CreateReportTemplateCommand(
            Name: "Valid Name",
            Description: null,
            Module: "",
            ReportFormat: ReportFormat.CSV,
            QueryDefinition: "SELECT 1",
            TemplateContent: null,
            IsSystemTemplate: false);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Module);
    }
}
