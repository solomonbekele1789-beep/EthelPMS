using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Documents.Infrastructure.Persistence;

public class DocumentsDbContext : MultiTenantDbContext, IDocumentsDbContext
{
    public DbSet<DocumentFolder> DocumentFolders => Set<DocumentFolder>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentVersion> DocumentVersions => Set<DocumentVersion>();
    public DbSet<DocumentComment> DocumentComments => Set<DocumentComment>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public DocumentsDbContext(DbContextOptions<DocumentsDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("content");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DocumentsDbContext).Assembly);
        modelBuilder.Entity<OutboxMessage>().ToTable("document_outbox_messages");
    }
}
