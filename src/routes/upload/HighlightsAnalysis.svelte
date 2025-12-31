<script>
    export let transcript = "";
    export let highlights = ""; // String from your API
    export let highlightsLoading = false;
    export let generateHighlights = () => {};

    let copied = false;

    // Parses the bullet points from the backend string into an array
    $: highlightList = highlights
        ? highlights
            .split('\n')
            .map(line => line.replace(/^[*-]\s*/, '').trim())
            .filter(line => line.length > 0)
        : [];

    function copyAllHighlights() {
        if (!highlights) return;
        
        const header = `--- MEETING HIGHLIGHTS & INSIGHTS ---\n\n`;
        navigator.clipboard.writeText(header + highlights);
        
        copied = true;
        setTimeout(() => copied = false, 2000);
    }
</script>

<div class="enterprise-theme-context">
  <div class="card glass-card mb-3">
    <div class="card-body p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="text-white fw-bold m-0">
          <i class="fa-solid fa-wand-magic-sparkles me-2 text-amber"></i> 
          Key Highlights
        </h5>
        
        {#if highlightList.length > 0 && !highlightsLoading}
          <button 
            class="btn btn-copy-all {copied ? 'active' : ''}" 
            on:click={copyAllHighlights}
          >
            {#if copied}
              <i class="fa-solid fa-check me-1"></i> Copied!
            {:else}
              <i class="fa-solid fa-copy me-1"></i> Copy All
            {/if}
          </button>
        {/if}
      </div>

      {#if highlightsLoading}
        <div class="text-amber mb-2 small animate-pulse d-flex align-items-center">
          <i class="fa-solid fa-sparkles fa-spin-pulse me-2"></i> 
          <span class="text-white">Synthesizing notable moments...</span>
        </div>
      {:else if highlightList.length > 0}
        <div class="highlight-list mb-4">
          {#each highlightList as item}
            <div class="highlight-item mb-3">
              <div class="highlight-card-inner">
                <div class="d-flex gap-3">
                  <div class="highlight-icon">
                    <i class="fa-solid fa-star"></i>
                  </div>
                  <div class="highlight-content">
                    <p class="text-white-90 mb-0 fw-medium leading-relaxed">
                      {item}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <button class="btn btn-outline-amber w-100 py-2" on:click={generateHighlights}>
          <i class="fa-solid fa-rotate-right me-2"></i> Refresh Highlights
        </button>
      {:else}
        <div class="empty-state text-center py-2">
          <p class="text-light-muted small mb-4">Discover important insights, concerns, and notable context from the conversation.</p>
          <button 
            class="btn btn-amber-glow w-100 py-2" 
            disabled={!transcript?.trim()} 
            on:click={generateHighlights}
          >
            Extract Highlights
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .enterprise-theme-context {
    --amber-primary: #fcd34d;
    --amber-glow: rgba(252, 211, 77, 0.3);
    --bg-card: #0e111d;
    --glass-border: rgba(255, 255, 255, 0.08);
    --text-muted: #94a3b8;
  }

  .glass-card {
    background: var(--bg-card) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: 20px;
  }

  /* Copy Button */
  .btn-copy-all {
    background: rgba(252, 211, 77, 0.1);
    border: 1px solid rgba(252, 211, 77, 0.2);
    color: var(--amber-primary);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 8px;
    transition: 0.2s ease;
  }

  .btn-copy-all:hover {
    background: var(--amber-primary);
    color: #000;
  }

  .btn-copy-all.active {
    background: #10b981;
    border-color: #10b981;
    color: white;
  }

  /* Highlight Item Row */
  .highlight-item {
    background: rgba(252, 211, 77, 0.02);
    border: 1px solid rgba(252, 211, 77, 0.1);
    border-left: 3px solid var(--amber-primary);
    border-radius: 12px;
    transition: transform 0.2s ease;
  }
  .highlight-item:hover {
    background: rgba(252, 211, 77, 0.04);
    transform: translateX(4px);
  }

  .highlight-card-inner { padding: 14px 16px; }

  .highlight-icon {
    background: rgba(252, 211, 77, 0.1);
    color: var(--amber-primary);
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; flex-shrink: 0;
    margin-top: 2px;
  }

  .text-white-90 { color: rgba(255, 255, 255, 0.9); font-size: 0.9rem; }
  .text-amber { color: var(--amber-primary) !important; }
  .text-light-muted { color: var(--text-muted); }

  /* Buttons */
  .btn-amber-glow {
    background: var(--amber-primary); color: #000; border: none;
    border-radius: 10px; font-weight: 700;
    box-shadow: 0 4px 15px var(--amber-glow);
  }
  .btn-amber-glow:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-outline-amber {
    border: 1px solid var(--amber-primary); color: var(--amber-primary);
    background: transparent; border-radius: 10px; font-weight: 600;
    transition: 0.2s;
  }
  .btn-outline-amber:hover { background: var(--amber-primary); color: #000; }

  .animate-pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .leading-relaxed { line-height: 1.6; }
</style>