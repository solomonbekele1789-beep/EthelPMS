using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.DeleteArticle;

public sealed class DeleteArticleCommandHandler : IRequestHandler<DeleteArticleCommand, Unit>
{
    private readonly IKnowledgeMgmtDbContext _db;

    public DeleteArticleCommandHandler(IKnowledgeMgmtDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteArticleCommand request, CancellationToken ct)
    {
        var article = await _db.KbArticles.FirstOrDefaultAsync(a => a.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbArticle), request.Id);

        _db.KbArticles.Remove(article);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
