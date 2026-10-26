using FluentAssertions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.FundAccounting.Domain.Events;

namespace NGO.PMS.FundAccounting.Tests.Domain;

public class BudgetTests
{
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _accountId = Guid.NewGuid();

    private Budget CreateDraftBudget() =>
        Budget.Create("Annual Budget", _projectId, 2026, "USD", 1.0m, _orgId);

    private Budget CreateSubmittedBudget()
    {
        var budget = CreateDraftBudget();
        budget.AddLine(_accountId, "Operating expenses", 1000m, 1000m, 1000m, 1000m);
        budget.Submit();
        return budget;
    }

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var budget = CreateDraftBudget();

        budget.Title.Should().Be("Annual Budget");
        budget.ProjectId.Should().Be(_projectId);
        budget.FiscalYear.Should().Be(2026);
        budget.CurrencyCode.Should().Be("USD");
        budget.ExchangeRate.Should().Be(1.0m);
        budget.Status.Should().Be(BudgetStatus.Draft);
        budget.Version.Should().Be(1);
        budget.OrganizationId.Should().Be(_orgId);
        budget.TotalAmount.Should().Be(0);
    }

    [Fact]
    public void Submit_DraftBudget_SetsSubmitted()
    {
        var budget = CreateDraftBudget();
        budget.AddLine(_accountId, "Operating expenses", 1000m, 1000m, 1000m, 1000m);

        budget.Submit();

        budget.Status.Should().Be(BudgetStatus.Submitted);
    }

    [Fact]
    public void Approve_SubmittedBudget_SetsApprovedAndRaisesEvent()
    {
        var budget = CreateSubmittedBudget();
        var userId = Guid.NewGuid();

        budget.Approve(userId);

        budget.Status.Should().Be(BudgetStatus.Approved);
        budget.ApprovedBy.Should().Be(userId);
        budget.ApprovalDate.Should().NotBeNull();
        budget.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<BudgetApprovedEvent>();
    }

    [Fact]
    public void Approve_DraftBudget_ThrowsInvalidOperationException()
    {
        var budget = CreateDraftBudget();

        var act = () => budget.Approve(Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*submitted*");
    }
}
