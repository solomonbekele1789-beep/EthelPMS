using AutoMapper;
using NGO.PMS.Partnerships.Application.DTOs;
using NGO.PMS.Partnerships.Domain.Entities;

namespace NGO.PMS.Partnerships.Application.Mappings;

public class PartnershipsMappingProfile : Profile
{
    public PartnershipsMappingProfile()
    {
        CreateMap<SubGrantee, SubGranteeDto>()
            .ForMember(d => d.PartnerType, o => o.MapFrom(s => s.PartnerType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.RiskRating, o => o.MapFrom(s => s.RiskRating.ToString()));

        CreateMap<SubGrantee, SubGranteeListDto>()
            .ForMember(d => d.PartnerType, o => o.MapFrom(s => s.PartnerType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.RiskRating, o => o.MapFrom(s => s.RiskRating.ToString()));

        CreateMap<Disbursement, DisbursementDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<PartnerReport, PartnerReportDto>()
            .ForMember(d => d.ReportType, o => o.MapFrom(s => s.ReportType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<PartnerReport, PartnerReportListDto>()
            .ForMember(d => d.ReportType, o => o.MapFrom(s => s.ReportType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.SubGranteeName, o => o.Ignore());

        CreateMap<PartnerCompliance, PartnerComplianceDto>()
            .ForMember(d => d.ComplianceType, o => o.MapFrom(s => s.ComplianceType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
    }
}
