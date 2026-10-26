using MediatR;

namespace NGO.PMS.Planning.Application.Dip.Commands.CreateDipItem;

public record CreateDipItemCommand(
    Guid ActivityId,
    Guid ProjectId,
    string Title,
    string? Description,
    DateTimeOffset PlannedStartDate,
    DateTimeOffset PlannedEndDate,
    decimal BudgetAllocated,
    Guid? ResponsibleUserId,
    int SortOrder) : IRequest<Guid>;
