using MediatR;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Application.Queries.ListFundCodes;

public sealed record ListFundCodesQuery(
    FundType? FundType,
    bool? IsActive) : IRequest<List<FundCodeDto>>;
