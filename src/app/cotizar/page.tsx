import { Suspense } from "react";
import CotizarForm from "./CotizarForm";

export default function CotizarPage() {
  return (
    <Suspense>
      <CotizarForm />
    </Suspense>
  );
}
