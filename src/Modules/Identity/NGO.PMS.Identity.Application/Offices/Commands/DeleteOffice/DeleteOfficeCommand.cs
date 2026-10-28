using MediatR;

namespace NGO.PMS.Identity.Application.Offices.Commands.DeleteOffice;

public record DeleteOfficeCommand(Guid Id) : IRequest;
