using MediatR;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Templates.Commands.AddTemplateSection;

public sealed record AddTemplateSectionCommand(
    Guid ReportTemplateId,
    string Title,
    SectionType SectionType,
    int SortOrder,
    bool IsRequired,
    string? Instructions) : IRequest<Guid>;
