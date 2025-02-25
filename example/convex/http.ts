import { httpRouter } from "convex/server";
import { polar } from "./example";

const http = httpRouter();

polar.registerRoutes(http, {
  // Optional custom path, default is "/events/polar"
  path: "/events/polar",
});

export default http;
