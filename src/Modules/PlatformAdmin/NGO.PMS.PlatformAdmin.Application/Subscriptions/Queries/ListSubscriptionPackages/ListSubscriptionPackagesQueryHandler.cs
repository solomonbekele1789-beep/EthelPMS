using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Subscriptions.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Subscriptions.Queries.ListSubscriptionPackages;

public class ListSubscriptionPackagesQueryHandler : IRequestHandler<ListSubscriptionPackagesQuery, List<SubscriptionPackageDto>>
{
    private readonly IPlatformDbContext _db;
    private readonly IMapper _mapper;

    public ListSubscriptionPackagesQueryHandler(IPlatformDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<SubscriptionPackageDto>> Handle(ListSubscriptionPackagesQuery request, CancellationToken cancellationToken)
    {
        var packages = await _db.SubscriptionPackages
            .Where(p => p.IsActive)
            .OrderBy(p => p.PriceMonthlyUsd)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<SubscriptionPackageDto>>(packages);
    }
}
