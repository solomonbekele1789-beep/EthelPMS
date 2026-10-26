using Microsoft.EntityFrameworkCore;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Feedback.Infrastructure.Persistence;

public class FeedbackDbContext : MultiTenantDbContext, IFeedbackDbContext
{
    public DbSet<FeedbackCategory> FeedbackCategories => Set<FeedbackCategory>();
    public DbSet<FeedbackItem> FeedbackItems => Set<FeedbackItem>();
    public DbSet<FeedbackResponse> FeedbackResponses => Set<FeedbackResponse>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public FeedbackDbContext(DbContextOptions<FeedbackDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("content");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FeedbackDbContext).Assembly);
        modelBuilder.Entity<OutboxMessage>().ToTable("feedback_outbox_messages");
    }
}
