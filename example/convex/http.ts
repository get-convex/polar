import { httpRouter } from "convex/server";
import { polar } from "./example";

const http = httpRouter();

polar.registerRoutes(http, {
  // Optional custom path, default is "/events/polar"
  path: "/events/polar",
  // Optional callback for when a subscription is updated
  onSubscriptionUpdated: async (ctx, event) => {
    console.log("Subscription updated", event);
    if (event.data.customerCancellationReason) {
      console.log(
        "Customer cancellation reason",
        event.data.customerCancellationReason
      );
      console.log(
        "Customer cancellation comment",
        event.data.customerCancellationComment
      );
    }
    // This callback is run in an Action, so you could pipe this customer
    // cancellation reason to another service, for example.
  },
  // Other available callbacks:
  onSubscriptionCreated: undefined,
  onProductCreated: undefined,
  onProductUpdated: undefined,
});

export default http;
