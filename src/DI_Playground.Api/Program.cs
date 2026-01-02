using DI_Playground.Api.Enum;
using DI_Playground.Api.Hubs;
using DI_Playground.Api.Models;
using DI_Playground.Api.Services;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddHealthChecks();

var frontendOrigin = builder.Configuration["FRONTEND_ORIGIN"]!;

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy
            .WithOrigins(frontendOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

builder.Services.AddScoped<IScopedGuidService, ScopedGuidService>();
builder.Services.AddTransient<ITransientGuidService, TransientGuidService>();
builder.Services.AddSingleton<ISingletonGuidService, SingletonGuidService>();
builder.Services.AddSingleton<IBuggySingletonService, BuggySingletonService>();

builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");

app.MapHealthChecks("/health");

app.MapHub<DiEventsHub>("/hubs/di-events");

app.MapPost("/api/di/run", async (
    DiMode mode,
    IServiceProvider provider,
    IHubContext<DiEventsHub> hub
) =>
{
    var requestId = Guid.NewGuid();
    var index = 0;

    using var scope = provider.CreateScope();
    var scopedProvider = scope.ServiceProvider;

    switch (mode)
    {
        case DiMode.Normal:
            for (var i = 0; i < 3; i++)
                await Emit(hub, requestId, "Transient", scopedProvider.GetRequiredService<ITransientGuidService>().Id, ++index, true);

            var sService = scopedProvider.GetRequiredService<IScopedGuidService>();
            for (var i = 0; i < 3; i++)
                await Emit(hub, requestId, "Scoped", sService.Id, ++index, i == 0);

            var sgService = scopedProvider.GetRequiredService<ISingletonGuidService>();
            for (var i = 0; i < 3; i++)
                await Emit(hub, requestId, "Singleton", sgService.Id, ++index, i == 0);
            break;

        case DiMode.CaptiveScopedInSingleton:
            var buggy1 = provider.GetRequiredService<IBuggySingletonService>();
            await Emit(hub, requestId, "Scoped (CAPTIVE)", buggy1.ResolveScoped(), ++index, true);
            await Emit(hub, requestId, "Scoped (CAPTIVE)", buggy1.ResolveScoped(), ++index, false);
            break;

        case DiMode.CaptiveTransientInSingleton:
            var buggy2 = provider.GetRequiredService<IBuggySingletonService>();
            await Emit(hub, requestId, "Transient (CAPTIVE)", buggy2.ResolveTransient(), ++index, true);
            await Emit(hub, requestId, "Transient (CAPTIVE)", buggy2.ResolveTransient(), ++index, false);
            break;

        case DiMode.CaptiveTransientInScoped:
            var scopedSvc = scopedProvider.GetRequiredService<IScopedGuidService>();
            await Emit(hub, requestId, "Transient (IN-SCOPED)", scopedSvc.Id, ++index, true);
            break;

        case DiMode.ServiceLocatorInSingleton:
            var buggy3 = provider.GetRequiredService<IBuggySingletonService>();
            await Emit(hub, requestId, "Transient (LOCATOR)", buggy3.ResolveTransientManual(), ++index, true);
            await Emit(hub, requestId, "Transient (LOCATOR)", buggy3.ResolveTransientManual(), ++index, true);
            break;
    }

    return Results.Ok(new { requestId, mode = mode.ToString() });
});

app.Run();

static Task Emit(
    IHubContext<DiEventsHub> hub,
    Guid requestId,
    string lifetime,
    Guid instanceId,
    int index,
    bool created
)
{
    var evt = new DiEvent
    {
        RequestId = requestId,
        Lifetime = lifetime,
        ServiceName = lifetime,
        InstanceId = instanceId,
        ResolutionIndex = index,
        Created = created,
        Timestamp = DateTime.UtcNow
    };

    return hub.Clients.All.SendAsync("di-event", evt);
}
