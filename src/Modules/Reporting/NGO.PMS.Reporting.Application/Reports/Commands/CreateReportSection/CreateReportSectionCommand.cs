using MediatR;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Reports.Commands.CreateReportSection;

public sealed record CreateReportSectionCommand(
    Guid ReportId,
    string Title,
    SectionType SectionType,
    int SortOrder,
    Guid? TemplateSectionId,
    string? Content) : IRequest<Guid>;
