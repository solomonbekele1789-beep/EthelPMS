using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.GoodsReceipts.CreateGoodsReceivedNote;

public sealed class CreateGoodsReceivedNoteCommandHandler : IRequestHandler<CreateGoodsReceivedNoteCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateGoodsReceivedNoteCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateGoodsReceivedNoteCommand request, CancellationToken ct)
    {
        var grn = GoodsReceivedNote.Create(
            request.ReferenceNumber,
            request.PurchaseOrderId,
            request.ReceivedDate,
            request.ReceivedBy,
            _currentUser.OrganizationId);

        _db.GoodsReceivedNotes.Add(grn);
        await _db.SaveChangesAsync(ct);
        return grn.Id;
    }
}
