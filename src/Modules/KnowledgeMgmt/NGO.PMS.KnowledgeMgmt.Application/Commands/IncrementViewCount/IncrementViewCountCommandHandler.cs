using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.IncrementViewCount;

public sealed class IncrementViewCountCommandHandler : IRequestHandler<IncrementViewCountCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public IncrementViewCountCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(IncrementViewCountCommand request, CancellationToken ct)
    {
        var article = await _db.KbArticles.FirstOrDefaultAsync(a => a.Id == request.ArticleId, ct);
        if (article is not null)
        {
            article.IncrementViewCount();
            await _db.SaveChangesAsync(ct);
        }

        return Unit.Value;
    }
}
