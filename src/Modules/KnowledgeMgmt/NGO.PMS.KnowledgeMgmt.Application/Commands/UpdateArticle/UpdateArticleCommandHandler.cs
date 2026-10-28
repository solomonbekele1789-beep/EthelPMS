using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.UpdateArticle;

public sealed class UpdateArticleCommandHandler : IRequestHandler<UpdateArticleCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public UpdateArticleCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateArticleCommand request, CancellationToken ct)
    {
        var article = await _db.KbArticles.FirstOrDefaultAsync(a => a.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbArticle), request.Id);

        article.Update(request.CategoryId, request.Title, request.Content,
            request.Summary, request.Tags, request.IsFeatured);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
