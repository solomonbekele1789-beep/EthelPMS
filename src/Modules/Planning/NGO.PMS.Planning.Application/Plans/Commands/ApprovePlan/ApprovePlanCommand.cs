using MediatR;

namespace NGO.PMS.Planning.Application.Plans.Commands.ApprovePlan;

public record ApprovePlanCommand(Guid PlanEntryId) : IRequest;
