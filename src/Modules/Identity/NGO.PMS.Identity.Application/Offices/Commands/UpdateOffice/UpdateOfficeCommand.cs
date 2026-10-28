using MediatR;

namespace NGO.PMS.Identity.Application.Offices.Commands.UpdateOffice;

public record UpdateOfficeCommand(Guid Id, string Name, string Code, Guid? ParentOfficeId, Guid? LocationId) : IRequest;
