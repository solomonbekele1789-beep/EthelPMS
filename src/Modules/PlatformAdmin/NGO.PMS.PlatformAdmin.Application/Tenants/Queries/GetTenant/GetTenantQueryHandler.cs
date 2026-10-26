using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenant;

public class GetTenantQueryHandler : IRequestHandler<GetTenantQuery, TenantDetailDto>
{
    private readonly IPlatformDbContext _db;
    private readonly IMapper _mapper;

    public GetTenantQueryHandler(IPlatformDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<TenantDetailDto> Handle(GetTenantQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .Include(t => t.SubscriptionPackage)
            .Include(t => t.TenantModules)
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        return _mapper.Map<TenantDetailDto>(tenant);
    }
}
