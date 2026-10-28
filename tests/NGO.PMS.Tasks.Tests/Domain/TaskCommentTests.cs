using FluentAssertions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Tests.Domain;

public class TaskCommentTests
{
    private readonly Guid _taskItemId = Guid.NewGuid();
    private readonly Guid _authorId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Create_ValidInput_ReturnsComment()
    {
        var comment = TaskComment.Create(
            _taskItemId, "This is a comment", _authorId, "John Doe", _orgId);

        comment.Should().NotBeNull();
        comment.TaskItemId.Should().Be(_taskItemId);
        comment.Content.Should().Be("This is a comment");
        comment.AuthorUserId.Should().Be(_authorId);
        comment.AuthorName.Should().Be("John Doe");
        comment.OrganizationId.Should().Be(_orgId);
        comment.ParentCommentId.Should().BeNull();
    }

    [Fact]
    public void Edit_ByAuthor_UpdatesContent()
    {
        var comment = TaskComment.Create(
            _taskItemId, "Original content", _authorId, "John Doe", _orgId);

        comment.Edit("Updated content", _authorId);

        comment.Content.Should().Be("Updated content");
    }

    [Fact]
    public void Edit_ByNonAuthor_ThrowsInvalidOperationException()
    {
        var comment = TaskComment.Create(
            _taskItemId, "Original content", _authorId, "John Doe", _orgId);
        var nonAuthorId = Guid.NewGuid();

        var act = () => comment.Edit("Hacked content", nonAuthorId);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*author*");
    }
}
