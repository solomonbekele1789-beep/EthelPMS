using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Reporting.Application.Templates.Commands.CreateReportTemplate;
using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.Reporting.Tests.Helpers;

namespace NGO.PMS.Reporting.Tests.Application;

public class CreateReportTemplateTests
{
    [Fact]
    public async Task Handler_ShouldCreateTemplate()
    {
        var orgId = Guid.NewGuid();
        using var db = ReportingTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ReportingTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateReportTemplateCommandHandler(db, currentUser);
        var command = new CreateReportTemplateCommand(
            Name: "Standard Monthly",
            ReportType: ReportType.Monthly,
            Description: "Default monthly report template",
            RequiredApprovalLevels: 2,
            SubmissionDeadlineDays: 10);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.ReportTemplates.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Standard Monthly");
        saved.ReportType.Should().Be(ReportType.Monthly);
        saved.RequiredApprovalLevels.Should().Be(2);
        saved.SubmissionDeadlineDays.Should().Be(10);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validator_ShouldFail_WhenNameEmpty()
    {
        var validator = new CreateReportTemplateCommandValidator();
        var command = new CreateReportTemplateCommand("", ReportType.Monthly, null, 1, 7);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validator_ShouldFail_WhenApprovalLevelsZero()
    {
        var validator = new CreateReportTemplateCommandValidator();
        var command = new CreateReportTemplateCommand("Test", ReportType.Monthly, null, 0, 7);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.RequiredApprovalLevels);
    }
}
