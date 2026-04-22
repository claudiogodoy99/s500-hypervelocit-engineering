FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY TicTacToe.sln ./
COPY src/TicTacToe.Api/TicTacToe.Api.csproj src/TicTacToe.Api/
COPY tests/TicTacToe.Api.Tests/TicTacToe.Api.Tests.csproj tests/TicTacToe.Api.Tests/
RUN dotnet restore src/TicTacToe.Api/TicTacToe.Api.csproj

COPY . .
RUN dotnet publish src/TicTacToe.Api/TicTacToe.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:3000
EXPOSE 3000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TicTacToe.Api.dll"]