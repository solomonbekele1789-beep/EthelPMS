using MediatR;

namespace NGO.PMS.Identity.Application.Offices.Commands.UpdateOffice;

public record UpdateOfficeCommand(
    Guid Id,
    string Name,
    string Code,
    string OfficeType = "HeadOffice",
    string? Description = null,
    string? LocationAddress = null,
    double? Latitude = null,
    double? Longitude = null,
    bool IsActive = true,
    Guid? ParentOfficeId = null,
    Guid? LocationId = null) : IRequest;
