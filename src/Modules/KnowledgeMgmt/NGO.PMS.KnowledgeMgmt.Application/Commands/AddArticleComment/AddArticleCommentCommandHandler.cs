using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.AddArticleComment;

public sealed class AddArticleCommentCommandHandler : IRequestHandler<AddArticleCommentCommand, Guid>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddArticleCommentCommandHandler(IKnowledgeMgmtDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddArticleCommentCommand request, CancellationToken ct)
    {
        var articleExists = await _db.KbArticles.AnyAsync(a => a.Id == request.ArticleId, ct);
        if (!articleExists)
            throw new NotFoundException(nameof(Domain.Entities.KbArticle), request.ArticleId);

        var comment = KbArticleComment.Create(
            _currentUser.OrganizationId,
            request.ArticleId,
            _currentUser.UserId,
            request.Content,
            request.ParentCommentId);

        _db.KbArticleComments.Add(comment);
        await _db.SaveChangesAsync(ct);
        return comment.Id;
    }
}
