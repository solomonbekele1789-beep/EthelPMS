using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Identity.Domain.Enums;

namespace NGO.PMS.Identity.Domain.Entities;

public class Organization : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string Timezone { get; private set; } = "Africa/Addis_Ababa";
    public CalendarPreference CalendarPreference { get; private set; } = CalendarPreference.Ethiopian;
    public string Settings { get; private set; } = "{}";

    // Navigation
    public ICollection<Office> Offices { get; private set; } = [];

    public static Organization Create(string name, string slug)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        return new Organization { Name = name.Trim(), Slug = slug.ToLowerInvariant().Trim() };
    }

    public void Update(string name, string? logoUrl, string? timezone, CalendarPreference? calendarPreference, string? settings = null)
    {
        Name = name.Trim();
        if (logoUrl is not null) LogoUrl = logoUrl;
        if (timezone is not null) Timezone = timezone;
        if (calendarPreference.HasValue) CalendarPreference = calendarPreference.Value;
        if (settings is not null) Settings = settings;
    }
}
