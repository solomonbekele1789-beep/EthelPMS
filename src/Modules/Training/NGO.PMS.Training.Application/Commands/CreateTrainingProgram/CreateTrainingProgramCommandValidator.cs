using FluentValidation;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingProgram;

public class CreateTrainingProgramCommandValidator : AbstractValidator<CreateTrainingProgramCommand>
{
    public CreateTrainingProgramCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.TotalSessions).GreaterThan(0);
    }
}
