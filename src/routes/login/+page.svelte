<script>
  import { page } from '$app/stores';

  // Extract supabase from the data prop passed from +layout.js
  export let data;

  async function signInWithGoogle() {
    // Fallback logic: check data prop first, then page store
    const supabase = data?.supabase || $page.data.supabase;

    if (!supabase) {
      console.error('Supabase client not found. Ensure +layout.js is returning it.');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error('Error logging in:', error.message);
  }
</script>

<div class="auth-container mt-5">
  <div class="glow-circle top-left"></div>
  <div class="glow-circle bottom-right"></div>

  <div class="glass-card">
    <div class="logo-section">
      <div class="logo-icon">🔍</div>
      <h1>MeetLens</h1>
      <p>Analyze your meetings with AI</p>
    </div>

    <div class="divider">
      <span>Continue with Google</span>
    </div>

    <button on:click={signInWithGoogle} class="google-signin-btn">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
      <span>Sign in with Google</span>
    </button>

    <p class="footer-text">By signing in, you agree to our Terms of Service.</p>
  </div>
</div>

<style>
  /* Styles remain identical to your provided code */
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #050505;
    font-family: 'Inter', -apple-system, sans-serif;
    color: white;
    overflow: hidden;
  }

  .auth-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 3rem;
    border-radius: 24px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .logo-icon { font-size: 3rem; margin-bottom: 1rem; }
  h1 { margin: 0; font-size: 2rem; letter-spacing: -1px; }
  p { color: #888; margin-top: 0.5rem; }

  .divider {
    margin: 2.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
  }
  .divider span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #0b0b0b;
    padding: 0 10px;
    font-size: 0.8rem;
    color: #555;
    text-transform: uppercase;
  }

  .google-signin-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: white;
    color: #1f1f1f;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
  }

  .google-signin-btn:hover {
    background: #f1f1f1;
    transform: translateY(-1px);
  }

  .google-signin-btn img { width: 20px; height: 20px; }

  .footer-text { font-size: 0.75rem; margin-top: 2rem; color: #444; }

  .glow-circle {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    z-index: 1;
  }
  .top-left { top: -50px; left: -50px; background: #4f46e5; }
  .bottom-right { bottom: -50px; right: -50px; background: #7c3aed; }
</style>