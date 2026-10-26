using Microsoft.EntityFrameworkCore;
using Moq;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Donors.Tests.Helpers;

public class TestDonorsDbContext : DbContext, IDonorsDbContext
{
    public DbSet<Donor> Donors => Set<Donor>();
    public DbSet<DonorContact> DonorContacts => Set<DonorContact>();
    public DbSet<Grant> Grants => Set<Grant>();
    public DbSet<GrantCondition> GrantConditions => Set<GrantCondition>();
    public DbSet<GrantReport> GrantReports => Set<GrantReport>();
    public DbSet<DonorCommunication> DonorCommunications => Set<DonorCommunication>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public TestDonorsDbContext(DbContextOptions<TestDonorsDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure entities with private constructors for EF Core
        modelBuilder.Entity<Donor>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<DonorContact>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<Grant>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<GrantCondition>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<GrantReport>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<DonorCommunication>(e =>
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

public static class DonorsTestFixture
{
    public static TestDonorsDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDonorsDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new TestDonorsDbContext(options);
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
