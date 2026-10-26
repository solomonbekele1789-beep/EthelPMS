using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.SubmitProcurementPlan;

public sealed record SubmitProcurementPlanCommand(Guid PlanId) : IRequest<Unit>;
