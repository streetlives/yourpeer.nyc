import { fetchAuthSession } from "aws-amplify/auth";

export const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (error) {
    console.error("Error retrieving JWT token:", error);
    return undefined;
  }
};

export const getAuthPayload = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.payload;
  } catch (error) {
    console.error("Error retrieving JWT token:", error);
    return undefined;
  }
};
