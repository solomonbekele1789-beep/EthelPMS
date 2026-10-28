using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Domain.Enums;
using NGO.PMS.Tasks.Domain.Events;

namespace NGO.PMS.Tasks.Domain.Entities;

public class TaskApprovalLog : AuditableEntity
{
    public Guid TaskItemId { get; private set; }
    public Guid ApproverId { get; private set; }
    public string ApproverName { get; private set; } = string.Empty;
    public ApprovalAction Action { get; private set; }
    public string? Comments { get; private set; }
    public int ApprovalLevel { get; private set; }
    public Guid OrganizationId { get; set; }

    private TaskApprovalLog() { }

    public static TaskApprovalLog Create(
        Guid taskItemId,
        Guid approverId,
        string approverName,
        ApprovalAction action,
        int approvalLevel,
        Guid organizationId,
        string? comments = null)
    {
        var log = new TaskApprovalLog
        {
            TaskItemId = taskItemId,
            ApproverId = approverId,
            ApproverName = approverName,
            Action = action,
            Comments = comments,
            ApprovalLevel = approvalLevel,
            OrganizationId = organizationId
        };

        log.AddDomainEvent(new TaskApprovalEvent(taskItemId, approverId, action));
        return log;
    }
}
