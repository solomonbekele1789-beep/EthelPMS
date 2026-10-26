using MediatR;

namespace NGO.PMS.Identity.Application.Offices.Commands.CreateOffice;

public record CreateOfficeCommand(string Name, string Code, Guid? ParentOfficeId, Guid? LocationId) : IRequest<Guid>;
