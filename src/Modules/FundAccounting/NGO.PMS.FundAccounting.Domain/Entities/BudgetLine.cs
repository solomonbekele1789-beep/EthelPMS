using NGO.PMS.FundAccounting.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class BudgetLine : AuditableEntity
{
    public Guid BudgetId { get; private set; }
    public Guid AccountId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal Q1Amount { get; private set; }
    public decimal Q2Amount { get; private set; }
    public decimal Q3Amount { get; private set; }
    public decimal Q4Amount { get; private set; }
    public decimal AnnualAmount { get; private set; }
    public decimal ActualAmount { get; private set; }
    public decimal Variance { get; private set; }
    public decimal UtilizationRate { get; private set; }
    public Guid OrganizationId { get; set; }

    private BudgetLine() { }

    public static BudgetLine Create(
        Guid budgetId,
        Guid accountId,
        string description,
        decimal q1,
        decimal q2,
        decimal q3,
        decimal q4,
        Guid orgId)
    {
        var line = new BudgetLine
        {
            BudgetId = budgetId,
            AccountId = accountId,
            Description = description,
            Q1Amount = q1,
            Q2Amount = q2,
            Q3Amount = q3,
            Q4Amount = q4,
            ActualAmount = 0,
            OrganizationId = orgId
        };

        line.RecalculateComputed();

        return line;
    }

    public void UpdateActuals(decimal actualAmount)
    {
        ActualAmount = actualAmount;
        RecalculateComputed();

        if (ActualAmount > AnnualAmount)
        {
            AddDomainEvent(new BudgetOverrunDetectedEvent(Id, AnnualAmount, ActualAmount));
        }
    }

    private void RecalculateComputed()
    {
        AnnualAmount = Q1Amount + Q2Amount + Q3Amount + Q4Amount;
        Variance = AnnualAmount - ActualAmount;
        UtilizationRate = AnnualAmount != 0
            ? Math.Round(ActualAmount / AnnualAmount * 100, 2)
            : 0;
    }
}
