using MediatR;
using NGO.PMS.Identity.Application.Locations.DTOs;
using NGO.PMS.Identity.Domain.Enums;

namespace NGO.PMS.Identity.Application.Locations.Queries.ListLocations;

public record ListLocationsQuery(LocationLevel Level, Guid? ParentId = null) : IRequest<List<LocationDto>>;
