using MediatR;

namespace NGO.PMS.Reporting.Application.Reports.Commands.AddReportComment;

public sealed record AddReportCommentCommand(
    Guid ReportId,
    string Content,
    Guid? ParentCommentId) : IRequest<Guid>;
