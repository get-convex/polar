import { Polar } from "@convex-dev/polar";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";

const http = httpRouter();

const polar = new Polar(components.polar);

polar.registerRoutes(http, {
  // Optional custom path, default is "/events/polar"
  path: "/events/polar",
});

export default http;
