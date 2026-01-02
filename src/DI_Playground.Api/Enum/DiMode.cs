namespace DI_Playground.Api.Enum;

public enum DiMode
{
    Normal,
    CaptiveScopedInSingleton,
    CaptiveTransientInSingleton,
    CaptiveTransientInScoped,
    ServiceLocatorInSingleton
}