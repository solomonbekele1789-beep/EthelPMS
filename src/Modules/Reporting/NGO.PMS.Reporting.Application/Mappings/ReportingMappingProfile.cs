using AutoMapper;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Application.Mappings;

public class ReportingMappingProfile : Profile
{
    public ReportingMappingProfile()
    {
        CreateMap<Report, ReportDto>()
            .ForMember(d => d.ReportType, o => o.MapFrom(s => s.ReportType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<Report, ReportListItemDto>()
            .ForMember(d => d.ReportType, o => o.MapFrom(s => s.ReportType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<ReportSection, ReportSectionDto>()
            .ForMember(d => d.SectionType, o => o.MapFrom(s => s.SectionType.ToString()));

        CreateMap<ReportDataEntry, ReportDataEntryDto>();

        CreateMap<ReportApproval, ReportApprovalDto>()
            .ForMember(d => d.Action, o => o.MapFrom(s => s.Action.ToString()));

        CreateMap<ReportComment, ReportCommentDto>();

        CreateMap<ReportTemplate, ReportTemplateDto>()
            .ForMember(d => d.ReportType, o => o.MapFrom(s => s.ReportType.ToString()));

        CreateMap<ReportTemplateSection, ReportTemplateSectionDto>()
            .ForMember(d => d.SectionType, o => o.MapFrom(s => s.SectionType.ToString()));
    }
}
