using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteActivity;

public record DeleteActivityCommand(Guid ActivityId) : IRequest;
