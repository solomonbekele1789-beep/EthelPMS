using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class BudgetRevision : AuditableEntity
{
    public Guid BudgetId { get; private set; }
    public BudgetRevisionType RevisionType { get; private set; }
    public string Justification { get; private set; } = null!;
    public decimal PreviousTotal { get; private set; }
    public decimal NewTotal { get; private set; }
    public Guid ApprovedBy { get; private set; }
    public DateTime ApprovalDate { get; private set; }
    public int VersionNumber { get; private set; }
    public Guid OrganizationId { get; set; }

    private BudgetRevision() { }

    public static BudgetRevision Create(
        Guid budgetId,
        BudgetRevisionType revisionType,
        string justification,
        decimal previousTotal,
        decimal newTotal,
        Guid approvedBy,
        Guid orgId)
    {
        var revision = new BudgetRevision
        {
            BudgetId = budgetId,
            RevisionType = revisionType,
            Justification = justification,
            PreviousTotal = previousTotal,
            NewTotal = newTotal,
            ApprovedBy = approvedBy,
            ApprovalDate = DateTime.UtcNow,
            OrganizationId = orgId
        };

        return revision;
    }
}
