namespace NGO.PMS.Identity.Application.Organizations.DTOs;

public record OrganizationDto(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    string Timezone,
    string CalendarPreference,
    int UserCount,
    int OfficeCount);
