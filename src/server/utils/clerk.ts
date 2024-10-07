import clerk from "@clerk/clerk-sdk-node";

/**
 * (Server Side) Retrieves user information based on the provided user ID.
 *
 * @async
 * @function
 * @param {string} id - The id of the user to retrieve information for.
 * @returns {Promise<{
 *   email: string,
 *   firstName: string,
 *   lastName: string
 * }>} A Promise that resolves to an object containing user information.
 */
export const getUserInformation = async (
  id: string,
): Promise<{
  email: string;
  firstName: string;
  lastName: string;
}> => {
  const user = await clerk.users.getUser(id);

  if (!user.firstName || !user.lastName || !user.emailAddresses[0])
    throw new Error("Something went wrong with clerk!");

  return {
    email: user.emailAddresses[0].emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};
