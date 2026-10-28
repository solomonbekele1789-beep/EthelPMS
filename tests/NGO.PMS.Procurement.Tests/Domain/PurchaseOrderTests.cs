using FluentAssertions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Domain.Events;

namespace NGO.PMS.Procurement.Tests.Domain;

public class PurchaseOrderTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _requestId = Guid.NewGuid();
    private readonly Guid _supplierId = Guid.NewGuid();

    private PurchaseOrder CreateDraftOrder()
        => PurchaseOrder.Create("PO-001", _requestId, _supplierId, _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var po = CreateDraftOrder();

        po.ReferenceNumber.Should().Be("PO-001");
        po.PurchaseRequestId.Should().Be(_requestId);
        po.SupplierId.Should().Be(_supplierId);
        po.Status.Should().Be(PurchaseOrderStatus.Draft);
        po.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void Issue_DraftOrder_SetsIssuedAndRaisesEvent()
    {
        var po = CreateDraftOrder();
        po.AddItem("Widget", 10m, "pcs", 5m);

        po.Issue();

        po.Status.Should().Be(PurchaseOrderStatus.Issued);
        po.DomainEvents.Should().ContainSingle(e => e is PurchaseOrderIssuedEvent);
    }

    [Fact]
    public void Issue_AlreadyIssued_ThrowsInvalidOperationException()
    {
        var po = CreateDraftOrder();
        po.AddItem("Widget", 10m, "pcs", 5m);
        po.Issue();

        var act = () => po.Issue();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddItem_RecomputesTotalAmount()
    {
        var po = CreateDraftOrder();

        po.AddItem("Widget A", 10m, "pcs", 5m);
        po.AddItem("Widget B", 3m, "kg", 20m);

        po.TotalAmount.Should().Be(10m * 5m + 3m * 20m);
    }

    [Fact]
    public void MarkFullyReceived_IssuedOrder_SetsStatus()
    {
        var po = CreateDraftOrder();
        po.AddItem("Widget", 10m, "pcs", 5m);
        po.Issue();

        po.MarkFullyReceived();

        po.Status.Should().Be(PurchaseOrderStatus.FullyReceived);
    }
}
