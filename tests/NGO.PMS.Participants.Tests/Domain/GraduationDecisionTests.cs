using FluentAssertions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;

namespace NGO.PMS.Participants.Tests.Domain;

public class GraduationDecisionTests
{
    private readonly Guid _participantId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Create_ReadyParticipant_SetsIsReadyTrue()
    {
        var decision = GraduationDecision.Create(
            _participantId, _projectId, _orgId, requiredMetPercentage: 90m);

        decision.IsReadyToGraduate.Should().BeTrue();
        decision.RequiredMetPercentage.Should().Be(90m);
        decision.Status.Should().Be(GraduationDecisionStatus.Pending);
    }

    [Fact]
    public void Create_NotReadyParticipant_SetsIsReadyFalse()
    {
        var decision = GraduationDecision.Create(
            _participantId, _projectId, _orgId, requiredMetPercentage: 70m);

        decision.IsReadyToGraduate.Should().BeFalse();
        decision.RequiredMetPercentage.Should().Be(70m);
    }

    [Fact]
    public void Approve_ReadyPendingDecision_SetsApproved()
    {
        var decision = GraduationDecision.Create(
            _participantId, _projectId, _orgId, requiredMetPercentage: 90m);
        var approverId = Guid.NewGuid();

        decision.Approve(approverId);

        decision.Status.Should().Be(GraduationDecisionStatus.Approved);
        decision.ApprovedByUserId.Should().Be(approverId);
        decision.GraduationDate.Should().NotBeNull();
        decision.DecisionDate.Should().NotBeNull();
        decision.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ParticipantGraduatedEvent>();
    }

    [Fact]
    public void Approve_NotReadyDecision_ThrowsInvalidOperationException()
    {
        var decision = GraduationDecision.Create(
            _participantId, _projectId, _orgId, requiredMetPercentage: 70m);

        var act = () => decision.Approve(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>().WithMessage("*not ready*");
    }

    [Fact]
    public void Reject_PendingDecision_SetsRejected()
    {
        var decision = GraduationDecision.Create(
            _participantId, _projectId, _orgId, requiredMetPercentage: 90m);

        decision.Reject("Needs more assessment data");

        decision.Status.Should().Be(GraduationDecisionStatus.Rejected);
        decision.RejectionReason.Should().Be("Needs more assessment data");
        decision.DecisionDate.Should().NotBeNull();
    }

    [Fact]
    public void Approve_AlreadyApproved_ThrowsInvalidOperationException()
    {
        var decision = GraduationDecision.Create(
            _participantId, _projectId, _orgId, requiredMetPercentage: 90m);
        decision.Approve(Guid.NewGuid());

        var act = () => decision.Approve(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>().WithMessage("*pending*");
    }
}
