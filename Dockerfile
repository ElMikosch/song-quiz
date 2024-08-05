FROM node:latest AS build-frontend
WORKDIR /usr/local/app
COPY ./src/frontend/ /usr/local/app
RUN npm install
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-backend
WORKDIR /app
COPY ./src/backend/*.csproj ./
RUN dotnet restore
COPY ./src/backend/ .
COPY --from=build-frontend /usr/local/app/dist/frontend/browser ./wwwroot
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /App
COPY --from=build-backend /app/out .
ENTRYPOINT ["dotnet", "backend.dll"]
