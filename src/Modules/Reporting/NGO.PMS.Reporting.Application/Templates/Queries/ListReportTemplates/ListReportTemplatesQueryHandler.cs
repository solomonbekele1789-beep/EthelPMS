using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Templates.Queries.ListReportTemplates;

public class ListReportTemplatesQueryHandler : IRequestHandler<ListReportTemplatesQuery, List<ReportTemplateDto>>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListReportTemplatesQueryHandler(IReportingDbContext db, ICurrentUserService currentUser, IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<List<ReportTemplateDto>> Handle(ListReportTemplatesQuery request, CancellationToken ct)
    {
        var query = _db.ReportTemplates
            .Where(t => t.OrganizationId == _currentUser.OrganizationId && !t.IsDeleted && t.IsActive)
            .AsQueryable();

        if (request.ReportType.HasValue)
            query = query.Where(t => t.ReportType == request.ReportType.Value);

        return await query
            .Include(t => t.Sections)
            .OrderBy(t => t.Name)
            .ProjectTo<ReportTemplateDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
