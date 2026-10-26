using FluentValidation;

namespace NGO.PMS.Assets.Application.Commands.AssetCategories.CreateAssetCategory;

public sealed class CreateAssetCategoryCommandValidator : AbstractValidator<CreateAssetCategoryCommand>
{
    public CreateAssetCategoryCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DefaultUsefulLifeYears).GreaterThan(0);
        RuleFor(x => x.DefaultResidualValuePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.DefaultDepreciationMethod).IsInEnum();
    }
}
