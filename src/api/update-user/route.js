async function handler({ userId, name, agreedToTerms }) {
  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    const updatedUser = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        agreed_to_terms = COALESCE(${agreedToTerms}, agreed_to_terms)
      WHERE id = ${userId}
      RETURNING *
    `;

    if (updatedUser.length === 0) {
      return { error: "User not found" };
    }

    return {
      success: true,
      user: updatedUser[0],
    };
  } catch (error) {
    return {
      error: "Failed to update user",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}