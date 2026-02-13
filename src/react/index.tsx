import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useEffect, useState, type PropsWithChildren, type MouseEvent } from "react";
import { useAction } from "convex/react";
import type { PolarComponentApi } from "../client/index.js";
export const CustomerPortalLink = ({
  polarApi,
  children,
  className,
}: PropsWithChildren<{
  polarApi: Pick<PolarComponentApi, "generateCustomerPortalUrl">;
  className?: string;
}>) => {
  const generateCustomerPortalUrl = useAction(
    polarApi.generateCustomerPortalUrl,
  );
  const [portalUrl, setPortalUrl] = useState<string>();

  useEffect(() => {
    void generateCustomerPortalUrl({}).then((result) => {
      if (result) {
        setPortalUrl(result.url);
      }
    });
  }, [generateCustomerPortalUrl]);

  if (!portalUrl) {
    return null;
  }

  return (
    <a className={className} href={portalUrl} target="_blank">
      {children}
    </a>
  );
};

/** Renders a checkout link. Supports embedded or redirect checkout, with optional lazy loading and trial configuration. */
export const CheckoutLink = ({
  polarApi,
  productIds,
  children,
  className,
  subscriptionId,
  theme = "dark",
  embed = true,
  lazy = false,
  trialInterval,
  trialIntervalCount,
}: PropsWithChildren<{
  polarApi: Pick<PolarComponentApi, "generateCheckoutLink">;
  productIds: string[];
  subscriptionId?: string;
  trialInterval?: "day" | "week" | "month" | "year" | null;
  trialIntervalCount?: number | null;
  className?: string;
  theme?: "dark" | "light";
  embed?: boolean;
  lazy?: boolean;
}>) => {
  const generateCheckoutLink = useAction(polarApi.generateCheckoutLink);
  const [checkoutLink, setCheckoutLink] = useState<string>();

  useEffect(() => {
    if (lazy) return;
    if (embed) {
      PolarEmbedCheckout.init();
    }
    void generateCheckoutLink({
      productIds,
      subscriptionId,
      origin: window.location.origin,
      successUrl: window.location.href,
      trialInterval,
      trialIntervalCount,
    }).then(({ url }) => setCheckoutLink(url));
  }, [lazy, productIds, subscriptionId, embed, generateCheckoutLink, trialInterval, trialIntervalCount]);

  const handleClick = lazy
    ? async (e: MouseEvent) => {
        e.preventDefault();
        const { url } = await generateCheckoutLink({
          productIds,
          subscriptionId,
          origin: window.location.origin,
          successUrl: window.location.href,
          trialInterval,
          trialIntervalCount,
        });
        if (embed) {
          await PolarEmbedCheckout.create(url, { theme });
        } else {
          window.open(url, "_blank");
        }
      }
    : undefined;

  return (
    <a
      className={className}
      href={checkoutLink ?? (lazy ? "#" : undefined)}
      onClick={handleClick}
      data-polar-checkout-theme={theme}
      {...(!lazy && embed ? { "data-polar-checkout": true } : {})}
    >
      {children}
    </a>
  );
};
