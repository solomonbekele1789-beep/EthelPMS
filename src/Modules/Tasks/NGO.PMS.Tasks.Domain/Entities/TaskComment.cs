using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Tasks.Domain.Entities;

public class TaskComment : AuditableEntity
{
    public Guid TaskItemId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public Guid AuthorUserId { get; private set; }
    public string AuthorName { get; private set; } = string.Empty;
    public Guid? ParentCommentId { get; private set; }
    public Guid OrganizationId { get; set; }

    private TaskComment() { }

    public static TaskComment Create(
        Guid taskItemId,
        string content,
        Guid authorUserId,
        string authorName,
        Guid organizationId,
        Guid? parentCommentId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        return new TaskComment
        {
            TaskItemId = taskItemId,
            Content = content,
            AuthorUserId = authorUserId,
            AuthorName = authorName,
            OrganizationId = organizationId,
            ParentCommentId = parentCommentId
        };
    }

    public void Edit(string content, Guid editorUserId)
    {
        if (AuthorUserId != editorUserId)
            throw new InvalidOperationException("Only the author can edit this comment.");

        ArgumentException.ThrowIfNullOrWhiteSpace(content);
        Content = content;
    }
}
