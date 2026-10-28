using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.UpdateCategory;

public sealed record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? Description,
    int SortOrder,
    bool IsActive) : IRequest<Unit>;
