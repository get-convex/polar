import { Polar } from "@convex-dev/polar";
import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";

const http = httpRouter();

const polar = new Polar(components.polar);

polar.registerRoutes(http, {
  path: "/events/polar",
  eventCallback: internal.example.polarEventCallback,
});

export default http;
