namespace DI_Playground.Api.Services;

public class BuggySingletonService(ITransientGuidService transient, IServiceProvider provider) : IBuggySingletonService
{
    private IScopedGuidService? _captiveScoped;

    public Guid ResolveTransient() => transient.Id;

    public Guid ResolveScoped()
    {
        this._captiveScoped ??= provider.CreateScope().ServiceProvider.GetRequiredService<IScopedGuidService>();
        return this._captiveScoped.Id;
    }

    public Guid ResolveTransientManual()
    {
        return provider.GetRequiredService<ITransientGuidService>().Id;
    }
}