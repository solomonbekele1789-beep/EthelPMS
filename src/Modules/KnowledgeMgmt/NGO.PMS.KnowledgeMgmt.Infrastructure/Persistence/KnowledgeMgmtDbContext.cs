using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.KnowledgeMgmt.Infrastructure.Persistence;

public class KnowledgeMgmtDbContext : MultiTenantDbContext, IKnowledgeMgmtDbContext
{
    public DbSet<KbCategory> KbCategories => Set<KbCategory>();
    public DbSet<KbArticle> KbArticles => Set<KbArticle>();
    public DbSet<KbArticleComment> KbArticleComments => Set<KbArticleComment>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public KnowledgeMgmtDbContext(DbContextOptions<KnowledgeMgmtDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("dashboards");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(KnowledgeMgmtDbContext).Assembly);
        modelBuilder.Entity<OutboxMessage>().ToTable("knowledge_outbox_messages");
    }
}
