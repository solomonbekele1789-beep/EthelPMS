using FluentValidation;

namespace NGO.PMS.Assets.Application.Commands.StockItems.CreateStockItem;

public sealed class CreateStockItemCommandValidator : AbstractValidator<CreateStockItemCommand>
{
    public CreateStockItemCommandValidator()
    {
        RuleFor(x => x.ItemCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ReorderLevel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
    }
}
