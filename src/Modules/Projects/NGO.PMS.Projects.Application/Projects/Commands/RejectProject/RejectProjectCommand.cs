using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.RejectProject;

public record RejectProjectCommand(Guid ProjectId, string Reason) : IRequest;
