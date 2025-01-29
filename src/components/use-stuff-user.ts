import { useEffect, useState } from "react";
import { getUsersOrganizations } from "@/components/auth";

export function useStuffUser(organizationId: string) {
  const [isStuffUser, setIsStuffUser] = useState<boolean | null>(null);

  useEffect(() => {
    const getUserOrganizations = async () => {
      const userOrganizations = await getUsersOrganizations();
      const isStuffUser =
        (userOrganizations &&
          userOrganizations.indexOf(organizationId) !== -1) ||
        false;
      setIsStuffUser(isStuffUser);
    };
    getUserOrganizations();
  }, [organizationId]);

  return { isStuffUser } as const;
}
