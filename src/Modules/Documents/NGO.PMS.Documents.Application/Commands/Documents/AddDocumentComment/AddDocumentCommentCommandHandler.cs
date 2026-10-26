using MediatR;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Application.Commands.Documents.AddDocumentComment;

public sealed class AddDocumentCommentCommandHandler : IRequestHandler<AddDocumentCommentCommand, Guid>
{
    private readonly IDocumentsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddDocumentCommentCommandHandler(IDocumentsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddDocumentCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = DocumentComment.Create(
            request.DocumentId,
            request.Content,
            _currentUser.UserId,
            _currentUser.FullName,
            _currentUser.OrganizationId,
            request.ParentCommentId);

        _db.DocumentComments.Add(comment);
        await _db.SaveChangesAsync(cancellationToken);

        return comment.Id;
    }
}
