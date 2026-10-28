using MediatR;
using NGO.PMS.Procurement.Application.DTOs;

namespace NGO.PMS.Procurement.Application.Queries.GetProcurementPlan;

public sealed record GetProcurementPlanQuery(Guid PlanId) : IRequest<ProcurementPlanDto>;
