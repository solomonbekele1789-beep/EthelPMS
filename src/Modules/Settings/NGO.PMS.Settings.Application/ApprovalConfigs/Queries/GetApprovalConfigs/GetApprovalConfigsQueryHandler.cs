using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Queries.GetApprovalConfigs;

public class GetApprovalConfigsQueryHandler : IRequestHandler<GetApprovalConfigsQuery, List<ApprovalConfigDto>>
{
    private readonly ISettingsDbContext _db;
    private readonly IMapper _mapper;

    public GetApprovalConfigsQueryHandler(ISettingsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ApprovalConfigDto>> Handle(GetApprovalConfigsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.ApprovalConfigs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(c => c.Module == request.Module);

        return await query
            .OrderBy(c => c.Module)
            .ThenBy(c => c.EntityType)
            .ProjectTo<ApprovalConfigDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
