using MediatR;

namespace NGO.PMS.Planning.Application.Plans.Commands.RejectPlan;

public record RejectPlanCommand(Guid PlanEntryId, string Reason) : IRequest;
