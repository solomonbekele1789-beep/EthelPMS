using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.ArchiveArticle;

public sealed class ArchiveArticleCommandHandler : IRequestHandler<ArchiveArticleCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public ArchiveArticleCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(ArchiveArticleCommand request, CancellationToken ct)
    {
        var article = await _db.KbArticles.FirstOrDefaultAsync(a => a.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbArticle), request.Id);

        article.Archive();

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
