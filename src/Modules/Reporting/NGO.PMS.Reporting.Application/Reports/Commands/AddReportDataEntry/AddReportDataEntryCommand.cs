using MediatR;

namespace NGO.PMS.Reporting.Application.Reports.Commands.AddReportDataEntry;

public sealed record AddReportDataEntryCommand(
    Guid ReportSectionId,
    string Key,
    string? Label,
    string? StringValue,
    decimal? NumericValue,
    int SortOrder,
    Guid? IndicatorId,
    Guid? ActivityId) : IRequest<Guid>;
