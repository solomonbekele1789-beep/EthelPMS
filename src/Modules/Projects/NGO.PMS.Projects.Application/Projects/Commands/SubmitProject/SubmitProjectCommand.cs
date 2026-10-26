using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.SubmitProject;

public record SubmitProjectCommand(Guid ProjectId) : IRequest;
