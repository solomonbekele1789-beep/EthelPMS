using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Queries.GetPurchaseOrder;

public sealed class GetPurchaseOrderQueryHandler : IRequestHandler<GetPurchaseOrderQuery, PurchaseOrderDto>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetPurchaseOrderQueryHandler(IProcurementDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<PurchaseOrderDto> Handle(GetPurchaseOrderQuery request, CancellationToken ct)
    {
        var po = await _db.PurchaseOrders
            .AsNoTracking()
            .Include(p => p.Items)
            .Where(p => p.Id == request.PurchaseOrderId && p.OrganizationId == _currentUser.OrganizationId)
            .ProjectTo<PurchaseOrderDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessRuleException("Purchase order not found.");

        return po;
    }
}
