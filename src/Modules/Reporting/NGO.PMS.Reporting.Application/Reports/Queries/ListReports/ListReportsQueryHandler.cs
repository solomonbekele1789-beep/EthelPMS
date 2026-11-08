using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Reports.Queries.ListReports;

public class ListReportsQueryHandler : IRequestHandler<ListReportsQuery, PagedResult<ReportListItemDto>>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListReportsQueryHandler(IReportingDbContext db, ICurrentUserService currentUser, IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<PagedResult<ReportListItemDto>> Handle(ListReportsQuery request, CancellationToken ct)
    {
        var query = _db.Reports
            .Where(r => r.OrganizationId == _currentUser.OrganizationId && !r.IsDeleted)
            .AsQueryable();

        if (request.ProjectId.HasValue && request.ProjectId.Value != Guid.Empty)
            query = query.Where(r => r.ProjectId == request.ProjectId.Value);
        if (request.ReportType.HasValue)
            query = query.Where(r => r.ReportType == request.ReportType.Value);
        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status.Value);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<ReportListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<ReportListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
