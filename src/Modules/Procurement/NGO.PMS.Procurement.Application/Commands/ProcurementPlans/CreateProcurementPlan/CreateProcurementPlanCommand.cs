using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.CreateProcurementPlan;

public sealed record CreateProcurementPlanCommand(
    string Title,
    Guid ProjectId,
    int FiscalYear,
    string? Description) : IRequest<Guid>;
