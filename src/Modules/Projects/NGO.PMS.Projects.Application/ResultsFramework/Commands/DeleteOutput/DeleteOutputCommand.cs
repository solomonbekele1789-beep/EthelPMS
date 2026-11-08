using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteOutput;

public record DeleteOutputCommand(Guid OutputId) : IRequest;
