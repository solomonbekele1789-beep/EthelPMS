using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Queries.ListDocuments;

public sealed class ListDocumentsQueryHandler : IRequestHandler<ListDocumentsQuery, PagedResult<DocumentDto>>
{
    private readonly IDocumentsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListDocumentsQueryHandler(IDocumentsDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<DocumentDto>> Handle(ListDocumentsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Documents.AsQueryable();

        if (request.FolderId.HasValue)
            query = query.Where(d => d.FolderId == request.FolderId.Value);

        if (request.Category.HasValue)
            query = query.Where(d => d.Category == request.Category.Value);

        if (request.Status.HasValue)
            query = query.Where(d => d.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(d =>
                d.FileName.Contains(request.Search) ||
                (d.DisplayName != null && d.DisplayName.Contains(request.Search)) ||
                (d.Tags != null && d.Tags.Contains(request.Search)));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(d => d.Versions)
            .ProjectTo<DocumentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<DocumentDto>(items, totalCount, request.Page, request.PageSize);
    }
}
