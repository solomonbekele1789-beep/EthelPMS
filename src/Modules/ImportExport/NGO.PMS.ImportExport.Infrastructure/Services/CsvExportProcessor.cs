using System.Text;
using NGO.PMS.ImportExport.Domain.Abstractions;

namespace NGO.PMS.ImportExport.Infrastructure.Services;

/// <summary>
/// CSV-based export processor. Generates CSV/Excel files for data export.
/// In production, integrate with CsvHelper or EPPlus for robust formatting.
/// </summary>
public sealed class CsvExportProcessor : IExportProcessor
{
    public Task<Stream> ExportAsync(
        string module, string entityType, string format, string? filterCriteria, CancellationToken ct = default)
    {
        // TODO: Implement real CSV/Excel export with CsvHelper or EPPlus
        var content = $"module,entityType,format,exported_at\n{module},{entityType},{format},{DateTimeOffset.UtcNow:O}";
        Stream stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
        return Task.FromResult(stream);
    }
}
