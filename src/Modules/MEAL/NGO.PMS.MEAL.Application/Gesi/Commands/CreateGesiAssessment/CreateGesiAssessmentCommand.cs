using MediatR;

namespace NGO.PMS.MEAL.Application.Gesi.Commands.CreateGesiAssessment;

public sealed record CreateGesiAssessmentCommand(
    Guid ProjectId,
    int GenderMarkerScore,
    DateTimeOffset AssessmentDate,
    string? Analysis,
    string? Justification) : IRequest<Guid>;
