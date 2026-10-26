using Microsoft.EntityFrameworkCore;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Documents.Application.Abstractions;

public interface IDocumentsDbContext
{
    DbSet<DocumentFolder> DocumentFolders { get; }
    DbSet<Document> Documents { get; }
    DbSet<DocumentVersion> DocumentVersions { get; }
    DbSet<DocumentComment> DocumentComments { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
