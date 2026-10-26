using FluentAssertions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.Assets.Domain.Events;

namespace NGO.PMS.Assets.Tests.Domain;

public class AssetDisposalTests
{
    private readonly Guid _assetId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _donorGrantId = Guid.NewGuid();

    private AssetDisposal CreateDefaultDisposal(bool requiresDonorApproval = false)
    {
        return AssetDisposal.Create(
            _assetId,
            "Obsolete",
            "Scrapping",
            500m,
            requiresDonorApproval,
            requiresDonorApproval ? _donorGrantId : null,
            _orgId);
    }

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var disposal = AssetDisposal.Create(
            _assetId,
            "Obsolete",
            "Scrapping",
            500m,
            false,
            null,
            _orgId);

        disposal.AssetId.Should().Be(_assetId);
        disposal.Reason.Should().Be("Obsolete");
        disposal.DisposalMethod.Should().Be("Scrapping");
        disposal.BookValueAtDisposal.Should().Be(500m);
        disposal.Status.Should().Be(DisposalStatus.Pending);
        disposal.RequiresDonorApproval.Should().BeFalse();
        disposal.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void Complete_WithoutDonorApproval_Succeeds()
    {
        var disposal = CreateDefaultDisposal(requiresDonorApproval: false);
        var userId = Guid.NewGuid();
        var disposalDate = DateTime.UtcNow;

        disposal.Complete(100m, disposalDate, userId);

        disposal.Status.Should().Be(DisposalStatus.Disposed);
        disposal.DisposalValue.Should().Be(100m);
        disposal.DisposalDate.Should().Be(disposalDate);
        disposal.ApprovedBy.Should().Be(userId);
        disposal.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<AssetDisposedEvent>();
    }

    [Fact]
    public void Complete_RequiresDonorApproval_NotApproved_ThrowsInvalidOperationException()
    {
        var disposal = CreateDefaultDisposal(requiresDonorApproval: true);
        var userId = Guid.NewGuid();

        var act = () => disposal.Complete(100m, DateTime.UtcNow, userId);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*donor approval*");
    }

    [Fact]
    public void Complete_DonorApproved_RaisesEvent()
    {
        var disposal = CreateDefaultDisposal(requiresDonorApproval: true);
        var userId = Guid.NewGuid();

        disposal.RequestDonorApproval();
        disposal.ApproveDonorApproval("REF-123");
        disposal.Complete(100m, DateTime.UtcNow, userId);

        disposal.Status.Should().Be(DisposalStatus.Disposed);
        disposal.DonorApprovalReference.Should().Be("REF-123");
        disposal.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<AssetDisposedEvent>();
    }
}
