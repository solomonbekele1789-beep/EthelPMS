using MediatR;
using NGO.PMS.Planning.Application.DTOs;

namespace NGO.PMS.Planning.Application.Dip.Queries.ListDipItems;

public record ListDipItemsQuery(Guid ActivityId) : IRequest<List<DipItemDto>>;
