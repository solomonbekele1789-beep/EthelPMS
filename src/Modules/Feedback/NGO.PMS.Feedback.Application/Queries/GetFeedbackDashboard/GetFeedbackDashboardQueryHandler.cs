using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Application.DTOs;
using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.Queries.GetFeedbackDashboard;

public sealed class GetFeedbackDashboardQueryHandler : IRequestHandler<GetFeedbackDashboardQuery, FeedbackDashboardDto>
{
    private readonly IFeedbackDbContext _db;

    public GetFeedbackDashboardQueryHandler(IFeedbackDbContext db)
    {
        _db = db;
    }

    public async Task<FeedbackDashboardDto> Handle(GetFeedbackDashboardQuery request, CancellationToken cancellationToken)
    {
        var allItems = await _db.FeedbackItems
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalCount = allItems.Count;
        var resolvedItems = allItems.Where(f => f.Status == FeedbackStatus.Resolved || f.Status == FeedbackStatus.Closed).ToList();
        var resolvedCount = resolvedItems.Count;

        var avgResolutionDays = resolvedItems
            .Where(f => f.ResolvedAt.HasValue)
            .Select(f => (f.ResolvedAt!.Value - f.CreatedAt.DateTime).TotalDays)
            .DefaultIfEmpty(0)
            .Average();

        var now = DateTime.UtcNow;
        var slaBreachedCount = allItems
            .Count(f => f.Status != FeedbackStatus.Resolved
                     && f.Status != FeedbackStatus.Closed
                     && now > f.SlaResolutionDeadline);

        // Group by category
        var categories = await _db.FeedbackCategories
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var categoryLookup = categories.ToDictionary(c => c.Id, c => c.Name);

        var byCategory = allItems
            .GroupBy(f => f.FeedbackCategoryId)
            .Select(g => new CategorySummaryDto
            {
                CategoryName = g.Key.HasValue && categoryLookup.TryGetValue(g.Key.Value, out var name)
                    ? name
                    : "Uncategorized",
                Count = g.Count()
            })
            .OrderByDescending(c => c.Count)
            .ToList();

        // Group by status
        var byStatus = allItems
            .GroupBy(f => f.Status)
            .Select(g => new StatusSummaryDto
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderBy(s => s.Status)
            .ToList();

        return new FeedbackDashboardDto
        {
            TotalCount = totalCount,
            ResolvedCount = resolvedCount,
            AvgResolutionDays = Math.Round(avgResolutionDays, 1),
            SlaBreachedCount = slaBreachedCount,
            ByCategory = byCategory,
            ByStatus = byStatus
        };
    }
}
