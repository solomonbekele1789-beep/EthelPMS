using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.ApproveProject;

public record ApproveProjectCommand(Guid ProjectId) : IRequest;
