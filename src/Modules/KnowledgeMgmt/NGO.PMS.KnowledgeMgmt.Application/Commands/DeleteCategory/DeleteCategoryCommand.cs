using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.DeleteCategory;

public sealed record DeleteCategoryCommand(Guid Id) : IRequest<Unit>;
