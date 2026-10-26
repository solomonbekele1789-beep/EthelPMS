using MediatR;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Application.Reports.Commands.AddReportComment;

public class AddReportCommentCommandHandler : IRequestHandler<AddReportCommentCommand, Guid>
{
    private readonly IReportingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddReportCommentCommandHandler(IReportingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddReportCommentCommand request, CancellationToken ct)
    {
        var comment = ReportComment.Create(
            request.ReportId,
            _currentUser.UserId,
            request.Content,
            _currentUser.OrganizationId,
            request.ParentCommentId);

        _db.ReportComments.Add(comment);
        await _db.SaveChangesAsync(ct);
        return comment.Id;
    }
}
