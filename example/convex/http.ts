import { Polar as PolarComponent } from "@convex-dev/polar";
import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";

const http = httpRouter();

const polarComponent = new PolarComponent(components.polar);

polarComponent.registerRoutes(http, {
  path: "/events/polar",
  eventCallback: internal.example.polarEventCallback,
});

export default http;
