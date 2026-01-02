namespace DI_Playground.Api.Services;

public interface ITransientGuidService
{
    Guid Id { get; }
}

public interface IScopedGuidService
{
    Guid Id { get; }
}

public interface ISingletonGuidService
{
    Guid Id { get; }
}

public interface IBuggySingletonService
{
    Guid ResolveScoped();
    Guid ResolveTransient();
    Guid ResolveTransientManual();
}