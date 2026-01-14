import { useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@/convex";

export function EnsureUser() {
  const upsertMe = useMutation(api.users.upsertMe);

  useEffect(() => {
    void upsertMe({});
  }, [upsertMe]);

  return null;
}
