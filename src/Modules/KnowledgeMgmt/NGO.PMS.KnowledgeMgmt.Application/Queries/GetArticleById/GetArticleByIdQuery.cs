using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticleById;

public sealed record GetArticleByIdQuery(Guid Id) : IRequest<KbArticleDto>;
