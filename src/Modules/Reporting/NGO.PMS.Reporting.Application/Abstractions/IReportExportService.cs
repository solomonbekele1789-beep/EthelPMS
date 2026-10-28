using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Abstractions;

/// <summary>
/// Export service interface for generating PDF, Excel, and Word reports.
/// REQ-RPT-016: PDF via QuestPDF, REQ-RPT-017: Excel via ClosedXML, REQ-RPT-018: Word via Open XML SDK.
/// Implementation deferred until export packages are available.
/// </summary>
public interface IReportExportService
{
    Task<byte[]> ExportToPdfAsync(Guid reportId, CancellationToken cancellationToken = default);
    Task<byte[]> ExportToExcelAsync(Guid reportId, CancellationToken cancellationToken = default);
    Task<byte[]> ExportToWordAsync(Guid reportId, CancellationToken cancellationToken = default);
}
