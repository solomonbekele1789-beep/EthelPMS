using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Application.DTOs;

namespace NGO.PMS.Feedback.Application.Queries.ListFeedbackCategories;

public sealed class ListFeedbackCategoriesQueryHandler : IRequestHandler<ListFeedbackCategoriesQuery, List<FeedbackCategoryDto>>
{
    private readonly IFeedbackDbContext _db;
    private readonly IMapper _mapper;

    public ListFeedbackCategoriesQueryHandler(IFeedbackDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<FeedbackCategoryDto>> Handle(ListFeedbackCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _db.FeedbackCategories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<FeedbackCategoryDto>>(categories);
    }
}
