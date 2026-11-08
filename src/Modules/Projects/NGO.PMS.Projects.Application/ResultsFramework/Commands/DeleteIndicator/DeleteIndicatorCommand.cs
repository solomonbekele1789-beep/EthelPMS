using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteIndicator;

public record DeleteIndicatorCommand(Guid IndicatorId) : IRequest;
