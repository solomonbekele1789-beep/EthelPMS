using AutoMapper;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Application.Mappings;

public sealed class FundAccountingMappingProfile : Profile
{
    public FundAccountingMappingProfile()
    {
        // AccountCategory -> AccountCategoryDto
        CreateMap<AccountCategory, AccountCategoryDto>()
            .ForMember(d => d.AccountType, opt => opt.MapFrom(s => s.AccountType.ToString()))
            .ForMember(d => d.SubCategories, opt => opt.MapFrom(s => s.SubCategories));

        // ChartOfAccount -> ChartOfAccountDto
        CreateMap<ChartOfAccount, ChartOfAccountDto>()
            .ForMember(d => d.AccountType, opt => opt.MapFrom(s => s.AccountType.ToString()))
            .ForMember(d => d.CategoryName, opt => opt.Ignore());

        // FundCode -> FundCodeDto
        CreateMap<FundCode, FundCodeDto>()
            .ForMember(d => d.FundType, opt => opt.MapFrom(s => s.FundType.ToString()));

        // FundRestriction -> FundRestrictionDto
        CreateMap<FundRestriction, FundRestrictionDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.FundCodeName, opt => opt.Ignore());

        // JournalEntry -> JournalEntryDto
        CreateMap<JournalEntry, JournalEntryDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Lines, opt => opt.MapFrom(s => s.Lines));

        // JournalLine -> JournalLineDto
        CreateMap<JournalLine, JournalLineDto>()
            .ForMember(d => d.AccountName, opt => opt.Ignore());

        // Budget -> BudgetDto
        CreateMap<Budget, BudgetDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Lines, opt => opt.MapFrom(s => s.Lines));

        // BudgetLine -> BudgetLineDto
        CreateMap<BudgetLine, BudgetLineDto>()
            .ForMember(d => d.AccountName, opt => opt.Ignore());
    }
}
