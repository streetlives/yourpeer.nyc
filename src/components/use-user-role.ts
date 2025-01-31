import { useEffect, useState } from "react";
import { getAuthPayload } from "@/components/auth";

export function useStuffUser(organizationId: string) {
  const [isStuffUser, setIsStuffUser] = useState<boolean | null>(null);

  useEffect(() => {
    const getUserOrganizations = async () => {
      const payload = await getAuthPayload();
      const org = payload?.["custom:orgs"] as string;

      setIsStuffUser(org?.split(",").includes(organizationId) || false);
    };
    getUserOrganizations();
  }, [organizationId]);

  return { isStuffUser } as const;
}

export function useAdminUser() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const payload = await getAuthPayload();
      const groups = payload?.["cognito:groups"] as string[];

      setIsAdmin(groups?.includes("StreetlivesAdmins") || false);
    };
    getUserRole();
  }, []);

  return { isAdmin } as const;
}
