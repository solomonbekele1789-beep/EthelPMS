namespace NGO.PMS.SystemReports.Domain.Abstractions;

public interface IReportGenerator
{
    Task<byte[]> GenerateAsync(string templateContent, string queryDefinition, string parameters, string format, CancellationToken cancellationToken = default);
}
