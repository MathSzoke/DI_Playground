var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.DI_Playground_Api>("DI-Playground-API")
    .WithHttpHealthCheck("/health");

var webFrontend = builder.AddNpmApp(
        "DI-Playground-Frontend",
        "../di_playground.web",
        "dev"
    )
    .WithHttpEndpoint(5173, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .WithReference(apiService)
    .WaitFor(apiService)
    .WithEnvironment("VITE_BACKEND_URL", apiService.GetEndpoint("https"));

apiService.WithEnvironment(
    "FRONTEND_ORIGIN",
    webFrontend.GetEndpoint("http")
);

builder.Build().Run();
