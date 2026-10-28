using FluentAssertions;
using NGO.PMS.Tasks.Domain.Entities;
using NGO.PMS.Tasks.Domain.Enums;
using NGO.PMS.Tasks.Domain.Events;

namespace NGO.PMS.Tasks.Tests.Domain;

public class TaskApprovalLogTests
{
    private readonly Guid _taskItemId = Guid.NewGuid();
    private readonly Guid _approverId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Create_ValidInput_CreatesLogAndRaisesEvent()
    {
        var log = TaskApprovalLog.Create(
            _taskItemId,
            _approverId,
            "Jane Approver",
            ApprovalAction.Approved,
            approvalLevel: 1,
            _orgId,
            comments: "Looks good");

        log.Should().NotBeNull();
        log.TaskItemId.Should().Be(_taskItemId);
        log.ApproverId.Should().Be(_approverId);
        log.ApproverName.Should().Be("Jane Approver");
        log.Action.Should().Be(ApprovalAction.Approved);
        log.Comments.Should().Be("Looks good");
        log.OrganizationId.Should().Be(_orgId);
        log.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<TaskApprovalEvent>();
    }

    [Fact]
    public void Create_SetsCorrectApprovalLevel()
    {
        var log = TaskApprovalLog.Create(
            _taskItemId,
            _approverId,
            "Jane Approver",
            ApprovalAction.Submitted,
            approvalLevel: 3,
            _orgId);

        log.ApprovalLevel.Should().Be(3);
    }
}
