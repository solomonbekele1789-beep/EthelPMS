using FluentAssertions;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.CashBank.Domain.Enums;
using Xunit;

namespace NGO.PMS.CashBank.Tests;

public class CashBankDomainTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void BankAccount_ApplyBalanceDelta_UpdatesCurrentBalance()
    {
        var account = BankAccount.Create(
            "CBE-001", "Main Operations ETB", "Commercial Bank of Ethiopia",
            "1000123456789", "ETB", BankAccountType.Checking, 50_000m, _orgId);

        account.ApplyBalanceDelta(15_000m);
        account.ApplyBalanceDelta(-5_000m);

        account.CurrentBalance.Should().Be(60_000m);
        account.CurrencyCode.Should().Be("ETB");
    }

    [Fact]
    public void CashTransaction_ApproveAndPost_TransitionsStatusAndComputesSignedDelta()
    {
        var tx = CashTransaction.Create(
            "PV-2026-001", Guid.NewGuid(), DateTime.UtcNow,
            CashTransactionType.Payment, 12_500m, "ETB", 1m,
            "Addis Stationery PLC", "Office supplies payment", _orgId);

        tx.Status.Should().Be(CashTransactionStatus.Draft);
        tx.Approve(Guid.NewGuid());
        tx.Status.Should().Be(CashTransactionStatus.Approved);
        tx.Post();
        tx.Status.Should().Be(CashTransactionStatus.Posted);
        tx.GetSignedBalanceDelta().Should().Be(-12_500m);
    }

    [Fact]
    public void PettyCashFund_DisburseAndReplenish_RespectsImprestLimit()
    {
        var fund = PettyCashFund.Create(
            "PCF-AA", "Addis Head Office Petty Cash", Guid.NewGuid(), Guid.NewGuid(),
            "ETB", 20_000m, 5_000m, _orgId);

        fund.Disburse(16_000m);
        fund.CurrentBalance.Should().Be(4_000m);
        fund.NeedsReplenishment.Should().BeTrue();

        fund.Replenish(16_000m);
        fund.CurrentBalance.Should().Be(20_000m);
        fund.NeedsReplenishment.Should().BeFalse();
    }

    [Fact]
    public void BankReconciliation_Complete_RequiresZeroDifference()
    {
        var rec = BankReconciliation.Create(
            Guid.NewGuid(), DateTime.UtcNow,
            DateTime.UtcNow.AddDays(-30), DateTime.UtcNow,
            100_000m, 95_000m, _orgId);

        rec.Difference.Should().Be(5_000m);
        var act = () => rec.Complete();
        act.Should().Throw<InvalidOperationException>();

        rec.UpdateBalances(100_000m, 100_000m);
        rec.Complete("Balanced against CBE monthly statement");
        rec.Status.Should().Be(ReconciliationStatus.Completed);
    }
}
