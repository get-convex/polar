import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useEffect, useState, type PropsWithChildren } from "react";
import { useAction } from "convex/react";
import type { PolarComponentApi } from "../client";
export const CustomerPortalLink = ({
  polarApi,
  children,
  className,
}: PropsWithChildren<{
  polarApi: Pick<PolarComponentApi, "generateCustomerPortalUrl">;
  className?: string;
}>) => {
  const generateCustomerPortalUrl = useAction(
    polarApi.generateCustomerPortalUrl
  );
  const [portalUrl, setPortalUrl] = useState<string>();

  useEffect(() => {
    void generateCustomerPortalUrl({}).then((result) => {
      if (result) {
        setPortalUrl(result.url);
      }
    });
  }, []);

  if (!portalUrl) {
    return null;
  }

  return (
    <a className={className} href={portalUrl} target="_blank">
      {children}
    </a>
  );
};

export const CheckoutLink = ({
  polarApi,
  productIds,
  children,
  className,
  subscriptionId,
  theme = "dark",
  embed = true,
}: PropsWithChildren<{
  polarApi: Pick<PolarComponentApi, "generateCheckoutLink">;
  productIds: string[];
  subscriptionId?: string;
  className?: string;
  theme?: "dark" | "light";
  embed?: boolean;
}>) => {
  const generateCheckoutLink = useAction(polarApi.generateCheckoutLink);
  const [checkoutLink, setCheckoutLink] = useState<string>();

  useEffect(() => {
    if (embed) {
      PolarEmbedCheckout.init();
    }
    void generateCheckoutLink({
      productIds,
      subscriptionId,
      origin: window.location.origin,
      successUrl: window.location.href,
    }).then(({ url }) => setCheckoutLink(url));
  }, [productIds, subscriptionId]);

  return (
    <a
      className={className}
      href={checkoutLink}
      data-polar-checkout-theme={theme}
      {...(embed ? { "data-polar-checkout": true } : {})}
    >
      {children}
    </a>
  );
};
