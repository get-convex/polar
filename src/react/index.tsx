import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { PropsWithChildren, useEffect, useState } from "react";
import { CheckoutApi } from "../client";
import { GenericDataModel } from "convex/server";
import { useAction } from "convex/react";

export const CheckoutLink = <DataModel extends GenericDataModel>({
  polarApi,
  productId,
  children,
  className,
}: PropsWithChildren<{
  polarApi: CheckoutApi<DataModel>;
  productId: string;
  className?: string;
}>) => {
  const generateCheckoutLink = useAction(polarApi.generateCheckoutLink);
  const [checkoutLink, setCheckoutLink] = useState<string>();

  useEffect(() => {
    PolarEmbedCheckout.init();
    void generateCheckoutLink({
      productId,
    }).then(({ url }) => setCheckoutLink(url));
  }, []);

  return (
    <a
      className={className}
      href={checkoutLink}
      data-polar-checkout
      //data-polar-checkout-theme="light"
    >
      {children}
    </a>
  );
};
