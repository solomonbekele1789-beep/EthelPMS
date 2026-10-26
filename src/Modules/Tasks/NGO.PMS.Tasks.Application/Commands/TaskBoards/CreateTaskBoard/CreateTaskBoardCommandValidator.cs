using FluentValidation;

namespace NGO.PMS.Tasks.Application.Commands.TaskBoards.CreateTaskBoard;

public sealed class CreateTaskBoardCommandValidator : AbstractValidator<CreateTaskBoardCommand>
{
    public CreateTaskBoardCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}
