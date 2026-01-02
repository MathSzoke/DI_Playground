namespace DI_Playground.Api.Models;

public class DiEvent
{
    public Guid RequestId { get; set; }
    public string Lifetime { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public Guid InstanceId { get; set; }
    public int ResolutionIndex { get; set; }
    public bool Created { get; set; }
    public DateTime Timestamp { get; set; }
}
