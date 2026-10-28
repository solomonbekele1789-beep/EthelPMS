using NGO.PMS.Feedback.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Domain.Entities;

public class FeedbackCategory : AuditableEntity, IMultiTenant
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public FeedbackType DefaultType { get; private set; }
    public int SlaResponseDays { get; private set; } = 5;
    public int SlaResolutionDays { get; private set; } = 30;
    public bool RequiresEscalation { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    public Guid TenantId { get; set; }

    private FeedbackCategory() { }

    public static FeedbackCategory Create(
        string name,
        string? description,
        FeedbackType defaultType,
        int slaResponseDays,
        int slaResolutionDays,
        bool requiresEscalation,
        int sortOrder)
    {
        var category = new FeedbackCategory
        {
            Name = name,
            Description = description,
            DefaultType = defaultType,
            SlaResponseDays = slaResponseDays,
            SlaResolutionDays = slaResolutionDays,
            RequiresEscalation = requiresEscalation,
            SortOrder = sortOrder
        };

        return category;
    }

    public void Update(
        string name,
        string? description,
        FeedbackType defaultType,
        int slaResponseDays,
        int slaResolutionDays,
        bool requiresEscalation,
        int sortOrder)
    {
        Name = name;
        Description = description;
        DefaultType = defaultType;
        SlaResponseDays = slaResponseDays;
        SlaResolutionDays = slaResolutionDays;
        RequiresEscalation = requiresEscalation;
        SortOrder = sortOrder;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
