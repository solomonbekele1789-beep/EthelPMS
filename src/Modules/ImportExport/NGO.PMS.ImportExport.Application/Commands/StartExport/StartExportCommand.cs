using MediatR;
using NGO.PMS.ImportExport.Domain.Enums;

namespace NGO.PMS.ImportExport.Application.Commands.StartExport;

public sealed record StartExportCommand(
    string Module,
    string EntityType,
    ExportFormat ExportFormat,
    string? FilterCriteria) : IRequest<Guid>;
