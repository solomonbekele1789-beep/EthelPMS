using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.RejectProcurementPlan;

public sealed record RejectProcurementPlanCommand(Guid PlanId, string Reason) : IRequest<Unit>;
