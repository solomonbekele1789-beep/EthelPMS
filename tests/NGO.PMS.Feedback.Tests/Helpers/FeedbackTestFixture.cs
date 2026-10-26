using Microsoft.EntityFrameworkCore;
using Moq;
using NGO.PMS.Feedback.Application.Abstractions;
using NGO.PMS.Feedback.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Feedback.Tests.Helpers;

public class TestFeedbackDbContext : DbContext, IFeedbackDbContext
{
    public DbSet<FeedbackCategory> FeedbackCategories => Set<FeedbackCategory>();
    public DbSet<FeedbackItem> FeedbackItems => Set<FeedbackItem>();
    public DbSet<FeedbackResponse> FeedbackResponses => Set<FeedbackResponse>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public TestFeedbackDbContext(DbContextOptions<TestFeedbackDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FeedbackCategory>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<FeedbackItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<FeedbackResponse>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<OutboxMessage>(e =>
        {
            e.HasKey(x => x.Id);
        });
    }
}

public static class FeedbackTestFixture
{
    public static TestFeedbackDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<TestFeedbackDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new TestFeedbackDbContext(options);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null, Guid? orgId = null, string? email = null)
    {
        var mock = new Mock<ICurrentUserService>();
        mock.Setup(x => x.UserId).Returns(userId ?? Guid.NewGuid());
        mock.Setup(x => x.OrganizationId).Returns(orgId ?? Guid.NewGuid());
        mock.Setup(x => x.Email).Returns(email ?? "test@example.com");
        mock.Setup(x => x.FullName).Returns("Test User");
        mock.Setup(x => x.IsAuthenticated).Returns(true);
        mock.Setup(x => x.Permissions).Returns(new List<string>());
        mock.Setup(x => x.Roles).Returns(new List<string>());
        return mock.Object;
    }
}
