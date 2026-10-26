using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Feedback.Application.Abstractions;

public interface IFeedbackDbContext
{
    DbSet<FeedbackCategory> FeedbackCategories { get; }
    DbSet<FeedbackItem> FeedbackItems { get; }
    DbSet<FeedbackResponse> FeedbackResponses { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
