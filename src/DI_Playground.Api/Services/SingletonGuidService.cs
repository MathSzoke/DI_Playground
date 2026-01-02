namespace DI_Playground.Api.Services;

public class SingletonGuidService : ISingletonGuidService
{
    public Guid Id { get; } = Guid.NewGuid();
}
