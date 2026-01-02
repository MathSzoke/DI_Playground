namespace DI_Playground.Api.Services;

public class TransientGuidService : ITransientGuidService
{
    public Guid Id { get; } = Guid.NewGuid();
}
