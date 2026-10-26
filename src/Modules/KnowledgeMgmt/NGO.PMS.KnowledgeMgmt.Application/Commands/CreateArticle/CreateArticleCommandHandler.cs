using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.CreateArticle;

public sealed class CreateArticleCommandHandler : IRequestHandler<CreateArticleCommand, Guid>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateArticleCommandHandler(IKnowledgeMgmtDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateArticleCommand request, CancellationToken ct)
    {
        var article = KbArticle.Create(
            _currentUser.OrganizationId,
            request.CategoryId,
            request.Title,
            request.Content,
            request.Summary,
            _currentUser.UserId,
            request.Tags,
            request.LinkedProjectId,
            request.LinkedEvaluationId,
            request.ArticleType);

        _db.KbArticles.Add(article);
        await _db.SaveChangesAsync(ct);
        return article.Id;
    }
}
