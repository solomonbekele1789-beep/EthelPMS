using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Domain.Entities;

public class FeedbackResponse : AuditableEntity, IMultiTenant
{
    public Guid FeedbackItemId { get; private set; }
    public Guid ResponderUserId { get; private set; }
    public string ResponderName { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public bool IsInternal { get; private set; }

    public Guid TenantId { get; set; }

    private FeedbackResponse() { }

    public static FeedbackResponse Create(
        Guid feedbackItemId,
        Guid responderUserId,
        string responderName,
        string content,
        bool isInternal)
    {
        return new FeedbackResponse
        {
            FeedbackItemId = feedbackItemId,
            ResponderUserId = responderUserId,
            ResponderName = responderName,
            Content = content,
            IsInternal = isInternal
        };
    }
}
