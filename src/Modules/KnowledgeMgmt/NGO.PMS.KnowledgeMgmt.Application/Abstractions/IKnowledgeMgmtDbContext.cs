using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.KnowledgeMgmt.Application.Abstractions;

public interface IKnowledgeMgmtDbContext
{
    DbSet<KbCategory> KbCategories { get; }
    DbSet<KbArticle> KbArticles { get; }
    DbSet<KbArticleComment> KbArticleComments { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
