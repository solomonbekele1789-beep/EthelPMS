using FluentValidation;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingSession;

public class CreateTrainingSessionCommandValidator : AbstractValidator<CreateTrainingSessionCommand>
{
    public CreateTrainingSessionCommandValidator()
    {
        RuleFor(x => x.TrainingProgramId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ScheduledDate).NotEmpty();
    }
}
