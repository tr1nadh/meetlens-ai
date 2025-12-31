<svelte:head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation'; // REQUIRED for softlinks
  import { user } from '$lib/store';
  import Navbar from './Navbar.svelte';

  // Extract supabase from the data provided by +layout.js
  $: ({ supabase, session } = $page.data);

  let subscription;

  // Sync auth state with the store
  $: if (supabase && !subscription) {
      const { data } = supabase.auth.onAuthStateChange((event, _session) => {
        if (_session) {
          $user = _session.user;
        } else {
          $user = null;
        }
      });
      subscription = data.subscription;
  }

  let loggedInUser = {};
  onMount(() => {
    if (session) {
      $user = session.user;
      loggedInUser = $user;
      console.log("Layout onMount - loggedInUser:", loggedInUser);
    } else {
      loggedInUser = null;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });

  /**
   * CLIENT-SIDE GUARD (Softlinks)
   * This watches for URL changes. If a user clicks a link to /upload 
   * but isn't in the store, it redirects them instantly.
   */
  $: if (typeof window !== 'undefined' && !loggedInUser) {
    const path = $page.url.pathname;
    if (path.startsWith('/upload') || path.startsWith('/upload/report')) {
      goto('/login');
    }
  }

  $: if (supabase && !subscription) {
      const { data } = supabase.auth.onAuthStateChange((event, _session) => {
        if (_session) {
          $user = _session.user;
          loggedInUser = $user; // ADD THIS: keep your local variable in sync
        } else {
          $user = null;
          loggedInUser = null; // ADD THIS: trigger redirect if they log out
        }
      });
      subscription = data.subscription;
  }
</script>

<Navbar />
<slot />