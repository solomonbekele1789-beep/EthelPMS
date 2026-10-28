using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Queries.ListSuppliers;

public sealed class ListSuppliersQueryHandler : IRequestHandler<ListSuppliersQuery, List<SupplierDto>>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListSuppliersQueryHandler(IProcurementDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<List<SupplierDto>> Handle(ListSuppliersQuery request, CancellationToken ct)
    {
        var query = _db.Suppliers
            .AsNoTracking()
            .Where(s => s.OrganizationId == _currentUser.OrganizationId);

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<SupplierStatus>(request.Status, out var status))
            query = query.Where(s => s.Status == status);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(s => s.Name.Contains(request.Search) || s.Email.Contains(request.Search));

        return await query
            .OrderBy(s => s.Name)
            .ProjectTo<SupplierDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
