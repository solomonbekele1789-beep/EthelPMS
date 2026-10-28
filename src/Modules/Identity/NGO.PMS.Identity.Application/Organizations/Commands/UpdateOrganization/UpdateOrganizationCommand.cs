using MediatR;
using NGO.PMS.Identity.Domain.Enums;

namespace NGO.PMS.Identity.Application.Organizations.Commands.UpdateOrganization;

public record UpdateOrganizationCommand(string Name, string? LogoUrl, string? Timezone, CalendarPreference? CalendarPreference) : IRequest;
