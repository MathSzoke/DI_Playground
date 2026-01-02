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
    string mode,
    IServiceProvider provider,
    IHubContext<DiEventsHub> hub
) =>
{
    var requestId = Guid.NewGuid();
    var index = 0;

    using var scope = provider.CreateScope();

    if (mode == "normal")
    {
        for (var i = 0; i < 3; i++)
        {
            index++;
            var t = scope.ServiceProvider.GetRequiredService<ITransientGuidService>();
            await Emit(hub, requestId, "Transient", t.Id, index, true);
        }

        for (var i = 0; i < 3; i++)
        {
            index++;
            var s = scope.ServiceProvider.GetRequiredService<IScopedGuidService>();
            await Emit(hub, requestId, "Scoped", s.Id, index, i == 0);
        }

        for (var i = 0; i < 3; i++)
        {
            index++;
            var sg = scope.ServiceProvider.GetRequiredService<ISingletonGuidService>();
            await Emit(hub, requestId, "Singleton", sg.Id, index, i == 0);
        }
    }

    if (mode == "bug-scoped-in-singleton")
    {
        var buggy = scope.ServiceProvider.GetRequiredService<IBuggySingletonService>();

        index++;
        var scopedId = buggy.ResolveScoped();
        await Emit(hub, requestId, "Scoped (BUG)", scopedId, index, true);

        index++;
        var transientId = buggy.ResolveTransient();
        await Emit(hub, requestId, "Transient (BUG)", transientId, index, true);
    }

    return Results.Ok(new { requestId, mode });
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
