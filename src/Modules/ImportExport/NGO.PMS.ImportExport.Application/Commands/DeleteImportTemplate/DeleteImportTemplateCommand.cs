using MediatR;

namespace NGO.PMS.ImportExport.Application.Commands.DeleteImportTemplate;

public sealed record DeleteImportTemplateCommand(Guid Id) : IRequest<Unit>;
