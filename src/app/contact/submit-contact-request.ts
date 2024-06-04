"use server";

export async function submitContactRequest({
  message = "",
  email = "",
  name = "",
  type = "general",
}: {
  readonly message: string;
  readonly email: string;
  readonly name: string;
  readonly type: string;
}) {
  const response = await fetch(process.env.FORMSPARK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      message,
      email,
      name,
      type,
    }),
  });

  if (!response.ok) {
    return {
      success: false,
      error: await response.text(),
    };
  }

  return {
    success: true,
    error: null,
  };
}
