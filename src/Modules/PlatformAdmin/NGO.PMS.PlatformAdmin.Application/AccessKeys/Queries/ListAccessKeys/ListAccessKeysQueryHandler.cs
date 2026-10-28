using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.AccessKeys.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Queries.ListAccessKeys;

public class ListAccessKeysQueryHandler : IRequestHandler<ListAccessKeysQuery, List<AccessKeyDto>>
{
    private readonly IPlatformDbContext _db;
    private readonly IMapper _mapper;

    public ListAccessKeysQueryHandler(IPlatformDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<AccessKeyDto>> Handle(ListAccessKeysQuery request, CancellationToken cancellationToken)
    {
        var keys = await _db.AccessKeys
            .Where(k => k.TenantId == request.TenantId)
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<AccessKeyDto>>(keys);
    }
}
