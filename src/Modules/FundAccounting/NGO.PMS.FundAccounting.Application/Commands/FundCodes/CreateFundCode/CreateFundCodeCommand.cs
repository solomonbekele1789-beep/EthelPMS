using MediatR;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Application.Commands.FundCodes.CreateFundCode;

public sealed record CreateFundCodeCommand(
    string Code,
    string Name,
    FundType FundType,
    string? Description,
    Guid? DonorGrantId) : IRequest<Guid>;
