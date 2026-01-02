namespace DI_Playground.Api.Services;

public class BuggySingletonService(IServiceProvider provider) : IBuggySingletonService
{
    public Guid ResolveScoped()
    {
        using var scope = provider.CreateScope();
        var scoped = scope.ServiceProvider.GetRequiredService<IScopedGuidService>();
        return scoped.Id;
    }

    public Guid ResolveTransient()
    {
        var transient = provider.GetRequiredService<ITransientGuidService>();
        return transient.Id;
    }
}
