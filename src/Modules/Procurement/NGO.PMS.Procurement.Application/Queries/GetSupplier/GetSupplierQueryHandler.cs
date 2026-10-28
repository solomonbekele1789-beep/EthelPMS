using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Queries.GetSupplier;

public sealed class GetSupplierQueryHandler : IRequestHandler<GetSupplierQuery, SupplierDto>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetSupplierQueryHandler(IProcurementDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<SupplierDto> Handle(GetSupplierQuery request, CancellationToken ct)
    {
        var supplier = await _db.Suppliers
            .AsNoTracking()
            .Where(s => s.OrganizationId == _currentUser.OrganizationId && s.Id == request.SupplierId)
            .ProjectTo<SupplierDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessRuleException("Supplier not found.");

        return supplier;
    }
}
