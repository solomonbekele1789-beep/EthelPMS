using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.ApproveProcurementPlan;

public sealed record ApproveProcurementPlanCommand(Guid PlanId) : IRequest<Unit>;
