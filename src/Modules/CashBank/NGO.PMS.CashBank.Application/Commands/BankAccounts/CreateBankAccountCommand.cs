using FluentValidation;
using MediatR;
using NGO.PMS.CashBank.Application.Abstractions;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Application.Commands.BankAccounts;

public sealed record CreateBankAccountCommand(
    string AccountCode,
    string AccountName,
    string BankName,
    string AccountNumber,
    string CurrencyCode,
    BankAccountType AccountType,
    decimal OpeningBalance,
    string? BranchName = null,
    string? SwiftCode = null,
    Guid? GlAccountId = null,
    Guid? FundCodeId = null,
    Guid? OfficeId = null) : IRequest<Guid>;

public sealed class CreateBankAccountCommandValidator : AbstractValidator<CreateBankAccountCommand>
{
    public CreateBankAccountCommandValidator()
    {
        RuleFor(x => x.AccountCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.AccountName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BankName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AccountNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CurrencyCode).NotEmpty().Length(3);
    }
}

public sealed class CreateBankAccountCommandHandler : IRequestHandler<CreateBankAccountCommand, Guid>
{
    private readonly ICashBankDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBankAccountCommandHandler(ICashBankDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var account = BankAccount.Create(
            request.AccountCode,
            request.AccountName,
            request.BankName,
            request.AccountNumber,
            request.CurrencyCode,
            request.AccountType,
            request.OpeningBalance,
            _currentUser.OrganizationId,
            request.BranchName,
            request.SwiftCode,
            request.GlAccountId,
            request.FundCodeId,
            request.OfficeId);

        _db.BankAccounts.Add(account);
        await _db.SaveChangesAsync(cancellationToken);
        return account.Id;
    }
}
