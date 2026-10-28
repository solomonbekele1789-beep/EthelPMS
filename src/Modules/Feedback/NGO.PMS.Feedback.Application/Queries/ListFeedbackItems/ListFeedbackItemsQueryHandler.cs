using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Application.DTOs;

namespace NGO.PMS.Feedback.Application.Queries.ListFeedbackItems;

public sealed class ListFeedbackItemsQueryHandler : IRequestHandler<ListFeedbackItemsQuery, PagedResult<FeedbackItemDto>>
{
    private readonly IFeedbackDbContext _db;
    private readonly IMapper _mapper;

    public ListFeedbackItemsQueryHandler(IFeedbackDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<FeedbackItemDto>> Handle(ListFeedbackItemsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.FeedbackItems
            .Include(f => f.Responses)
            .AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(f => f.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(f => f.Type == request.Type.Value);

        if (request.FeedbackCategoryId.HasValue)
            query = query.Where(f => f.FeedbackCategoryId == request.FeedbackCategoryId.Value);

        if (request.ProjectId.HasValue)
            query = query.Where(f => f.ProjectId == request.ProjectId.Value);

        if (request.IsConfidential.HasValue)
            query = query.Where(f => f.IsConfidential == request.IsConfidential.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<FeedbackItemDto>>(items);

        return new PagedResult<FeedbackItemDto>(dtos, totalCount, request.Page, request.PageSize);
    }
}
