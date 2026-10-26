using MediatR;
using NGO.PMS.Documents.Application.DTOs;

namespace NGO.PMS.Documents.Application.Queries.GetFolderTree;

public sealed record GetFolderTreeQuery(Guid? ProjectId = null) : IRequest<List<FolderTreeDto>>;
