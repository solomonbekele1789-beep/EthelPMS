using FluentAssertions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.MEAL.Domain.Enums;

namespace NGO.PMS.MEAL.Tests.Domain;

public class EvaluationFindingTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _evaluationId = Guid.NewGuid();

    private EvaluationFinding CreateOpenFinding()
        => EvaluationFinding.Create(_evaluationId, "Budget variance exceeds threshold", _orgId,
            DacCriteria.Efficiency, "Review budget controls");

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var finding = CreateOpenFinding();

        finding.Finding.Should().Be("Budget variance exceeds threshold");
        finding.Status.Should().Be(FindingStatus.Open);
        finding.EvaluationId.Should().Be(_evaluationId);
        finding.OrganizationId.Should().Be(_orgId);
        finding.DacCriteria.Should().Be(DacCriteria.Efficiency);
        finding.Recommendation.Should().Be("Review budget controls");
    }

    [Fact]
    public void ProvideManagementResponse_SetsResponseAndStatus()
    {
        var finding = CreateOpenFinding();
        var responsibleUser = Guid.NewGuid();

        finding.ProvideManagementResponse("Accepted, will implement controls", responsibleUser, DateTimeOffset.UtcNow.AddDays(30));

        finding.Status.Should().Be(FindingStatus.ResponseProvided);
        finding.ManagementResponse.Should().Be("Accepted, will implement controls");
        finding.ResponsibleUserId.Should().Be(responsibleUser);
        finding.ResponseDate.Should().NotBeNull();
        finding.DueDate.Should().NotBeNull();
    }

    [Fact]
    public void Verify_ValidVerifier_SetsVerified()
    {
        var creatorId = Guid.NewGuid();
        var responsibleUser = Guid.NewGuid();
        var verifier = Guid.NewGuid();

        var finding = EvaluationFinding.Create(_evaluationId, "Test finding", _orgId);
        // Simulate audit interceptor setting CreatedBy
        finding.CreatedBy = creatorId.ToString();

        finding.ProvideManagementResponse("Response", responsibleUser, null);

        finding.Verify(verifier, "Verified and confirmed");

        finding.Status.Should().Be(FindingStatus.Verified);
        finding.VerifiedByUserId.Should().Be(verifier);
        finding.VerifiedAt.Should().NotBeNull();
        finding.VerificationNotes.Should().Be("Verified and confirmed");
    }

    [Fact]
    public void Verify_VerifierIsResponsible_ThrowsInvalidOperationException()
    {
        var responsibleUser = Guid.NewGuid();
        var finding = CreateOpenFinding();
        finding.ProvideManagementResponse("Response", responsibleUser, null);

        var act = () => finding.Verify(responsibleUser, null);
        act.Should().Throw<InvalidOperationException>().WithMessage("*responsible*");
    }

    [Fact]
    public void Close_VerifiedFinding_SetsClosed()
    {
        var responsibleUser = Guid.NewGuid();
        var verifier = Guid.NewGuid();

        var finding = EvaluationFinding.Create(_evaluationId, "Test finding", _orgId);
        finding.ProvideManagementResponse("Response", responsibleUser, null);
        finding.Verify(verifier, null);

        finding.Close();

        finding.Status.Should().Be(FindingStatus.Closed);
    }
}
