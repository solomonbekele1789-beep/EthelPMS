using MediatR;

namespace NGO.PMS.Planning.Application.Plans.Commands.SubmitPlan;

public record SubmitPlanCommand(Guid PlanEntryId) : IRequest;
