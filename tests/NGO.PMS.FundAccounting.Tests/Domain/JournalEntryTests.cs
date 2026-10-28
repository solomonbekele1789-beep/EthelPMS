using FluentAssertions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.FundAccounting.Domain.Events;

namespace NGO.PMS.FundAccounting.Tests.Domain;

public class JournalEntryTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _accountId = Guid.NewGuid();

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var transactionDate = DateTime.UtcNow;

        var entry = JournalEntry.Create("JE-001", "Test entry", transactionDate, _orgId);

        entry.ReferenceNumber.Should().Be("JE-001");
        entry.Description.Should().Be("Test entry");
        entry.TransactionDate.Should().Be(transactionDate);
        entry.Status.Should().Be(JournalEntryStatus.Draft);
        entry.OrganizationId.Should().Be(_orgId);
        entry.TotalDebit.Should().Be(0);
        entry.TotalCredit.Should().Be(0);
        entry.Lines.Should().BeEmpty();
    }

    [Fact]
    public void AddLine_ValidLine_AddsToCollection()
    {
        var entry = JournalEntry.Create("JE-001", "Test entry", DateTime.UtcNow, _orgId);

        entry.AddLine(_accountId, 100m, 0m, "debit", null);

        entry.Lines.Should().HaveCount(1);
        entry.Lines[0].AccountId.Should().Be(_accountId);
        entry.Lines[0].DebitAmount.Should().Be(100m);
        entry.Lines[0].CreditAmount.Should().Be(0m);
        entry.TotalDebit.Should().Be(100m);
    }

    [Fact]
    public void Post_BalancedEntry_SetsPostedAndRaisesEvent()
    {
        var entry = JournalEntry.Create("JE-001", "Test entry", DateTime.UtcNow, _orgId);
        var creditAccountId = Guid.NewGuid();
        entry.AddLine(_accountId, 100m, 0m, "debit line", null);
        entry.AddLine(creditAccountId, 0m, 100m, "credit line", null);

        entry.Post();

        entry.Status.Should().Be(JournalEntryStatus.Posted);
        entry.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<JournalEntryPostedEvent>();
    }

    [Fact]
    public void Post_UnbalancedEntry_ThrowsInvalidOperationException()
    {
        var entry = JournalEntry.Create("JE-001", "Test entry", DateTime.UtcNow, _orgId);
        entry.AddLine(_accountId, 100m, 0m, "debit only", null);

        var act = () => entry.Post();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*unbalanced*");
    }

    [Fact]
    public void Post_EmptyLines_ThrowsInvalidOperationException()
    {
        var entry = JournalEntry.Create("JE-001", "Test entry", DateTime.UtcNow, _orgId);

        var act = () => entry.Post();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*no lines*");
    }
}
