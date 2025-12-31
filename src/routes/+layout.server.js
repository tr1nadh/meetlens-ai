/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals }) => {
  // Fallback: If hooks didn't load, return null instead of crashing
  if (!locals.safeGetSession) {
    console.error("Hook not found! Check file location: src/hooks.server.js");
    return { session: null, user: null };
  }

  const { session, user } = await locals.safeGetSession();
  return { session, user };
};