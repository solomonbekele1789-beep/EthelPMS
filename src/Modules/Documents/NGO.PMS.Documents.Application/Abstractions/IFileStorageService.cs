namespace NGO.PMS.Documents.Application.Abstractions;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct);
    Task<Stream> DownloadAsync(string storageUrl, CancellationToken ct);
}
