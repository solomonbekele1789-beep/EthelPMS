using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.PublishArticle;

public sealed class PublishArticleCommandHandler : IRequestHandler<PublishArticleCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public PublishArticleCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(PublishArticleCommand request, CancellationToken ct)
    {
        var article = await _db.KbArticles.FirstOrDefaultAsync(a => a.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbArticle), request.Id);

        article.Publish();

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
