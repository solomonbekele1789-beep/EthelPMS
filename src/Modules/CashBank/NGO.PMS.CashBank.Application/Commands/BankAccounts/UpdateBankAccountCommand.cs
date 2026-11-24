using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Application.Abstractions;

namespace NGO.PMS.CashBank.Application.Commands.BankAccounts;

public sealed record UpdateBankAccountCommand(
    Guid Id,
    string AccountName,
    string BankName,
    string? BranchName,
    string? SwiftCode,
    Guid? GlAccountId,
    Guid? FundCodeId,
    Guid? OfficeId) : IRequest;

public sealed class UpdateBankAccountCommandValidator : AbstractValidator<UpdateBankAccountCommand>
{
    public UpdateBankAccountCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AccountName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BankName).NotEmpty().MaximumLength(200);
    }
}

public sealed class UpdateBankAccountCommandHandler : IRequestHandler<UpdateBankAccountCommand>
{
    private readonly ICashBankDbContext _db;

    public UpdateBankAccountCommandHandler(ICashBankDbContext db) => _db = db;

    public async Task Handle(UpdateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _db.BankAccounts.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Bank account {request.Id} not found.");

        account.Update(
            request.AccountName,
            request.BankName,
            request.BranchName,
            request.SwiftCode,
            request.GlAccountId,
            request.FundCodeId,
            request.OfficeId);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
