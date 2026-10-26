using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.ImportExport.Application.Commands.StartImport;
using NGO.PMS.ImportExport.Tests.Helpers;

namespace NGO.PMS.ImportExport.Tests.Application;

public class StartImportTests
{
    [Fact]
    public async Task Should_Start_Valid_Import()
    {
        var userId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        using var db = ImportExportTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ImportExportTestFixture.CreateMockCurrentUser(userId: userId, orgId: orgId);

        var handler = new StartImportCommandHandler(db, currentUser);
        var command = new StartImportCommand(
            ImportTemplateId: Guid.NewGuid(),
            FileName: "beneficiaries.csv",
            FileSize: 102400,
            FileStoragePath: "/uploads/beneficiaries.csv",
            Module: "Participants",
            EntityType: "Participant");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.ImportJobs.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.FileName.Should().Be("beneficiaries.csv");
        saved.Module.Should().Be("Participants");
        saved.OrganizationId.Should().Be(orgId);
        saved.ImportedById.Should().Be(userId);
    }

    [Fact]
    public void Should_Fail_Without_FileName()
    {
        var validator = new StartImportCommandValidator();
        var command = new StartImportCommand(
            ImportTemplateId: Guid.NewGuid(),
            FileName: "",
            FileSize: 1024,
            FileStoragePath: "/uploads/test.csv",
            Module: "Participants",
            EntityType: "Participant");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.FileName);
    }

    [Fact]
    public void Should_Fail_Without_Module()
    {
        var validator = new StartImportCommandValidator();
        var command = new StartImportCommand(
            ImportTemplateId: null,
            FileName: "data.csv",
            FileSize: 2048,
            FileStoragePath: "/uploads/data.csv",
            Module: "",
            EntityType: "Donor");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Module);
    }
}
