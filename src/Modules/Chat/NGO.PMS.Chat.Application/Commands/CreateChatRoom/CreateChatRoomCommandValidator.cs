using FluentValidation;
using NGO.PMS.Chat.Domain.Enums;

namespace NGO.PMS.Chat.Application.Commands.CreateChatRoom;

public sealed class CreateChatRoomCommandValidator : AbstractValidator<CreateChatRoomCommand>
{
    public CreateChatRoomCommandValidator()
    {
        RuleFor(x => x.Type).IsInEnum();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200)
            .When(x => x.Type != ChatRoomType.Direct);

        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
