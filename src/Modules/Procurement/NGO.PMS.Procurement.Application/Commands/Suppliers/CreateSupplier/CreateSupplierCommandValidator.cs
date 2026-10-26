using FluentValidation;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.CreateSupplier;

public sealed class CreateSupplierCommandValidator : AbstractValidator<CreateSupplierCommand>
{
    public CreateSupplierCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.ContactPerson).NotEmpty().MaximumLength(200);
    }
}
