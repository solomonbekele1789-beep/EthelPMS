using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Procurement.Application.Abstractions;

public interface IProcurementDbContext
{
    DbSet<Supplier> Suppliers { get; }
    DbSet<ProcurementPlan> ProcurementPlans { get; }
    DbSet<ProcurementPlanItem> ProcurementPlanItems { get; }
    DbSet<PurchaseRequest> PurchaseRequests { get; }
    DbSet<PurchaseRequestItem> PurchaseRequestItems { get; }
    DbSet<RequestForQuotation> RequestForQuotations { get; }
    DbSet<RfqItem> RfqItems { get; }
    DbSet<RfqResponse> RfqResponses { get; }
    DbSet<BidEvaluation> BidEvaluations { get; }
    DbSet<PurchaseOrder> PurchaseOrders { get; }
    DbSet<PurchaseOrderItem> PurchaseOrderItems { get; }
    DbSet<GoodsReceivedNote> GoodsReceivedNotes { get; }
    DbSet<GrnItem> GrnItems { get; }
    DbSet<SupplierInvoice> SupplierInvoices { get; }
    DbSet<PaymentRequest> PaymentRequests { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
