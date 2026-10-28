using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Risk.Application.Risks.Commands.CreateRisk;
using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.Risk.Tests.Helpers;

namespace NGO.PMS.Risk.Tests.Application;

public class CreateRiskTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesRisk()
    {
        var orgId = Guid.NewGuid();
        using var db = RiskTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = RiskTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateRiskCommandHandler(db, currentUser);
        var command = new CreateRiskCommand(
            ProjectId: Guid.NewGuid(),
            Title: "Funding Delay Risk",
            Description: "Risk of delayed donor disbursement",
            Likelihood: Likelihood.High,
            Impact: Impact.Major);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Risks.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Funding Delay Risk");
        saved.Description.Should().Be("Risk of delayed donor disbursement");
        saved.Likelihood.Should().Be(Likelihood.High);
        saved.Impact.Should().Be(Impact.Major);
        saved.RiskScore.Should().Be(16); // High(4) * Major(4)
        saved.Status.Should().Be(RiskStatus.Identified);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Handle_EmptyTitle_ThrowsValidationException()
    {
        var validator = new CreateRiskCommandValidator();
        var command = new CreateRiskCommand(
            ProjectId: Guid.NewGuid(),
            Title: "",
            Description: "Some description",
            Likelihood: Likelihood.Medium,
            Impact: Impact.Moderate);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public async Task Handle_ReturnsNewRiskId()
    {
        var orgId = Guid.NewGuid();
        using var db = RiskTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = RiskTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateRiskCommandHandler(db, currentUser);
        var command = new CreateRiskCommand(
            ProjectId: Guid.NewGuid(),
            Title: "Supply Chain Risk",
            Description: "Risk of material supply disruption",
            Likelihood: Likelihood.Medium,
            Impact: Impact.Moderate);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var exists = await db.Risks.FindAsync(id);
        exists.Should().NotBeNull();
        exists!.Id.Should().Be(id);
    }
}
