using AutoMapper;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;

namespace NGO.PMS.KnowledgeMgmt.Application.Mappings;

public class KnowledgeMgmtMappingProfile : Profile
{
    public KnowledgeMgmtMappingProfile()
    {
        CreateMap<KbCategory, KbCategoryDto>()
            .ForMember(d => d.ChildCount, o => o.MapFrom(s => s.ChildCategories.Count));

        CreateMap<KbArticle, KbArticleDto>()
            .ForMember(d => d.ArticleType, o => o.MapFrom(s => s.ArticleType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category.Name));

        CreateMap<KbArticle, KbArticleListDto>()
            .ForMember(d => d.ArticleType, o => o.MapFrom(s => s.ArticleType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category.Name));

        CreateMap<KbArticleComment, KbArticleCommentDto>();
    }
}
