using FluentAssertions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.Procurement.Domain.Enums;

namespace NGO.PMS.Procurement.Tests.Domain;

public class SupplierInvoiceTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _supplierId = Guid.NewGuid();
    private readonly Guid _poId = Guid.NewGuid();

    private SupplierInvoice CreatePendingInvoice(decimal amount = 100m)
        => SupplierInvoice.Create("INV-001", _supplierId, _poId, amount, DateTime.UtcNow, _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var invoice = CreatePendingInvoice();

        invoice.InvoiceNumber.Should().Be("INV-001");
        invoice.SupplierId.Should().Be(_supplierId);
        invoice.PurchaseOrderId.Should().Be(_poId);
        invoice.InvoiceAmount.Should().Be(100m);
        invoice.Status.Should().Be(InvoiceStatus.Pending);
        invoice.ThreeWayMatchStatus.Should().Be(MatchingStatus.Pending);
        invoice.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void PerformThreeWayMatch_WithinTolerance_SetsMatched()
    {
        var invoice = CreatePendingInvoice(100m);

        invoice.PerformThreeWayMatch(100m, 100m);

        invoice.ThreeWayMatchStatus.Should().Be(MatchingStatus.Matched);
        invoice.Status.Should().Be(InvoiceStatus.Matched);
    }

    [Fact]
    public void PerformThreeWayMatch_OutsideTolerance_SetsDiscrepancy()
    {
        var invoice = CreatePendingInvoice(100m);

        invoice.PerformThreeWayMatch(90m, 100m);

        invoice.ThreeWayMatchStatus.Should().Be(MatchingStatus.Discrepancy);
    }

    [Fact]
    public void MarkPaid_VerifiedInvoice_SetsPaid()
    {
        var invoice = CreatePendingInvoice(100m);
        invoice.Verify(100m);

        invoice.MarkPaid();

        invoice.Status.Should().Be(InvoiceStatus.Paid);
    }
}
