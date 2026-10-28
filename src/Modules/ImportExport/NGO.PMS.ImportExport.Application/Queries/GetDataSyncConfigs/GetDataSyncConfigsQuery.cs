using MediatR;
using NGO.PMS.ImportExport.Application.DTOs;

namespace NGO.PMS.ImportExport.Application.Queries.GetDataSyncConfigs;

public sealed record GetDataSyncConfigsQuery() : IRequest<List<DataSyncConfigDto>>;
