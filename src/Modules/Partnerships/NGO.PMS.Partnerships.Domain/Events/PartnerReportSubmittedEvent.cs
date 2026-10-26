using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Events;

public sealed record PartnerReportSubmittedEvent(Guid ReportId, Guid SubGranteeId, string ReportType) : IDomainEvent;
