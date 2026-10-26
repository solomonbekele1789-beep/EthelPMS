using MediatR;

namespace NGO.PMS.Documents.Application.Commands.Documents.AddDocumentComment;

public sealed record AddDocumentCommentCommand(
    Guid DocumentId,
    string Content,
    Guid? ParentCommentId = null) : IRequest<Guid>;
