using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetProvisioningStatus;

public class GetProvisioningStatusQueryHandler : IRequestHandler<GetProvisioningStatusQuery, List<ProvisioningLogDto>>
{
    private readonly IPlatformDbContext _db;
    private readonly IMapper _mapper;

    public GetProvisioningStatusQueryHandler(IPlatformDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ProvisioningLogDto>> Handle(GetProvisioningStatusQuery request, CancellationToken cancellationToken)
    {
        var logs = await _db.ProvisioningLogs
            .Where(l => l.TenantId == request.TenantId)
            .OrderBy(l => l.StartedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<ProvisioningLogDto>>(logs);
    }
}
