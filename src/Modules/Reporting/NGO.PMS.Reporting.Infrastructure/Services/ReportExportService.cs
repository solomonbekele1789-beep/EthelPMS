using System.Text;
using NGO.PMS.Reporting.Application.Abstractions;

namespace NGO.PMS.Reporting.Infrastructure.Services;

/// <summary>
/// Placeholder report export service.
/// In production, implement with QuestPDF (PDF), ClosedXML (Excel), Open XML SDK (Word).
/// </summary>
public sealed class ReportExportService : IReportExportService
{
    public Task<byte[]> ExportToPdfAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        // TODO: Integrate QuestPDF for PDF generation
        var content = $"PDF Report Placeholder — Report ID: {reportId}, Generated: {DateTimeOffset.UtcNow:O}";
        return Task.FromResult(Encoding.UTF8.GetBytes(content));
    }

    public Task<byte[]> ExportToExcelAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        // TODO: Integrate ClosedXML for Excel generation
        var content = $"Excel Report Placeholder — Report ID: {reportId}, Generated: {DateTimeOffset.UtcNow:O}";
        return Task.FromResult(Encoding.UTF8.GetBytes(content));
    }

    public Task<byte[]> ExportToWordAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        // TODO: Integrate Open XML SDK for Word generation
        var content = $"Word Report Placeholder — Report ID: {reportId}, Generated: {DateTimeOffset.UtcNow:O}";
        return Task.FromResult(Encoding.UTF8.GetBytes(content));
    }
}
