namespace DI_Playground.Api.Services;

public class ScopedGuidService : IScopedGuidService
{
    public Guid Id { get; } = Guid.NewGuid();
}
