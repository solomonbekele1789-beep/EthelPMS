using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Application.Queries.GetSavedFilters;

public sealed class GetSavedFiltersQueryHandler : IRequestHandler<GetSavedFiltersQuery, List<SavedFilterDto>>
{
    private readonly IDashboardsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetSavedFiltersQueryHandler(IDashboardsDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<List<SavedFilterDto>> Handle(GetSavedFiltersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.SavedFilters
            .AsNoTracking()
            .Where(f => f.UserId == _currentUser.UserId);

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(f => f.Module == request.Module);

        var filters = await query
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<SavedFilterDto>>(filters);
    }
}
