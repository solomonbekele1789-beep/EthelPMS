using MediatR;
using NGO.PMS.Procurement.Domain.Enums;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.AddPlanItem;

public sealed record AddPlanItemCommand(
    Guid PlanId,
    string Description,
    decimal EstimatedCost,
    ProcurementMethod Method,
    int Quantity,
    string? Unit,
    int PlannedQuarter) : IRequest<Guid>;
