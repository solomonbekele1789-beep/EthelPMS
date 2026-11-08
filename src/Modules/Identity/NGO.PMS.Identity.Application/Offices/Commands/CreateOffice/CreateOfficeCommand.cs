using MediatR;

namespace NGO.PMS.Identity.Application.Offices.Commands.CreateOffice;

public record CreateOfficeCommand(
    string Name,
    string Code,
    string OfficeType = "HeadOffice",
    string? Description = null,
    string? LocationAddress = null,
    double? Latitude = null,
    double? Longitude = null,
    bool IsActive = true,
    Guid? ParentOfficeId = null,
    Guid? LocationId = null) : IRequest<Guid>;
