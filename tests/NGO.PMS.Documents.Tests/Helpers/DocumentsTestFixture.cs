using Microsoft.EntityFrameworkCore;
using Moq;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Documents.Tests.Helpers;

public class TestDocumentsDbContext : DbContext, IDocumentsDbContext
{
    public DbSet<DocumentFolder> DocumentFolders => Set<DocumentFolder>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentVersion> DocumentVersions => Set<DocumentVersion>();
    public DbSet<DocumentComment> DocumentComments => Set<DocumentComment>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public TestDocumentsDbContext(DbContextOptions<TestDocumentsDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DocumentFolder>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<Document>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<DocumentVersion>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<DocumentComment>(e =>
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

public static class DocumentsTestFixture
{
    public static TestDocumentsDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDocumentsDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new TestDocumentsDbContext(options);
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
