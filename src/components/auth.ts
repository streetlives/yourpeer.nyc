import { fetchAuthSession } from "aws-amplify/auth";

export const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    console.log(session.tokens?.idToken?.payload);
    return session.tokens?.idToken?.toString();
  } catch (error) {
    console.error("Error retrieving JWT token:", error);
    throw error;
  }
};

export const getUsersOrganizations = async () => {
  try {
    const session = await fetchAuthSession();
    const org = session.tokens?.idToken?.payload["custom:orgs"] as string;
    if (!org) return undefined;
    return org.split(",");
  } catch (error) {
    console.error("Error retrieving JWT token:", error);
    throw error;
  }
};
