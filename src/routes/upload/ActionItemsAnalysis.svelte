<script>
  export let transcript = "";
  export let actionItems = []; 
  export let actionItemsLoading = false;
  export let generateActionItems = () => {};

  function copyTask(text) {
    navigator.clipboard.writeText(text);
  }
</script>

<div class="enterprise-theme-context">
  <div class="card glass-card">
    <div class="card-body p-4">
      <h5 class="text-white fw-bold mb-4">
        <i class="fa-solid fa-list-check me-2 text-emerald"></i> 
        Action Items
      </h5>

      {#if actionItemsLoading}
        <div class="text-emerald mb-2 small animate-pulse d-flex align-items-center">
          <i class="fa-solid fa-spinner fa-spin me-2"></i> 
          <span class="text-white">Processing commitments...</span>
        </div>
      {:else if actionItems && actionItems.length > 0}
        <div class="action-list mb-4">
          {#each actionItems as item, i}
            <div class="action-item-container mb-3">
              <div class="action-card-inner">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="d-flex gap-3">
                    <div class="action-number">{i + 1}</div>
                    <div class="action-content">
                      <p class="text-white mb-1 fw-medium">{item.task}</p>
                      <div class="d-flex gap-2 flex-wrap">
                        <span class="badge badge-owner">
                          <i class="fa-solid fa-user me-1"></i> {item.owner}
                        </span>
                        {#if item.deadline}
                          <span class="badge badge-deadline">
                            <i class="fa-solid fa-calendar-day me-1"></i> {item.deadline}
                          </span>
                        {/if}
                      </div>
                    </div>
                  </div>
                  
                  <div class="action-actions d-flex gap-2">
                    <div class="info-wrapper">
                      <button class="btn-action-tool info-trigger">
                        <i class="fa-solid fa-circle-info"></i>
                      </button>
                      <div class="info-popover shadow-glow-emerald">
                        <div class="popover-header">
                          <i class="fa-solid fa-brain me-1"></i> AI REASONING
                        </div>
                        <div class="popover-body">
                          {item.reasoning}
                        </div>
                      </div>
                    </div>

                    <button class="btn-action-tool copy-btn" on:click={() => copyTask(item.task)}>
                      <i class="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <button class="btn btn-outline-emerald w-100 py-2" on:click={generateActionItems}>
          <i class="fa-solid fa-rotate-right me-2"></i> Refresh Action Plan
        </button>
      {:else}
        <div class="empty-state text-center py-3">
          <p class="text-light-muted small mb-4">No action items extracted yet.</p>
          <button 
            class="btn btn-emerald-glow w-100 py-2" 
            disabled={!transcript.trim()} 
            on:click={generateActionItems}
          >
            Extract Action Items
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* --- Visibility Fixes --- */
  .info-wrapper {
    position: relative;
    display: inline-block;
  }

  /* The actual popover box */
  .info-popover {
    visibility: hidden;
    position: absolute;
    bottom: 130%; /* Position above the icon */
    right: -10px;
    width: 260px;
    background: #05070a; /* Darker than the card for contrast */
    border: 1px solid var(--emerald-primary);
    border-radius: 12px;
    z-index: 100;
    padding: 0;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    pointer-events: none;
  }

  .info-wrapper:hover .info-popover {
    visibility: visible;
    opacity: 1;
    bottom: 140%;
  }

  .popover-header {
    background: rgba(16, 185, 129, 0.1);
    color: var(--emerald-primary);
    font-size: 0.65rem;
    font-weight: 800;
    padding: 6px 12px;
    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
    border-top-left-radius: 11px;
    border-top-right-radius: 11px;
    letter-spacing: 0.5px;
  }

  .popover-body {
    padding: 12px;
    color: #ffffff !important; /* Force pure white */
    font-size: 0.85rem;
    line-height: 1.5;
    font-style: normal;
  }

  /* Glow effect to make popover stand out against dark background */
  .shadow-glow-emerald {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(16, 185, 129, 0.2);
  }

  /* --- Tool Icons --- */
  .info-trigger:hover {
    color: var(--emerald-primary) !important;
  }
  
  .copy-btn:hover {
    color: #ffffff !important;
  }

  /* --- Layout & Base Styles --- */
  .enterprise-theme-context {
    --bg-dark-soft: #0e111d;
    --emerald-primary: #10b981;
    --border-glass: rgba(255, 255, 255, 0.1);
    --text-muted: #94a3b8;
  }

  .glass-card {
    background: var(--bg-dark-soft) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 20px;
    overflow: visible !important; /* Crucial so popover isn't cut off */
  }

  .action-item-container {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
  }

  .action-card-inner { padding: 15px; }

  .action-number {
    background: rgba(16, 185, 129, 0.1);
    color: var(--emerald-primary);
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
  }

  .badge-owner, .badge-deadline {
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 500;
  }

  .badge-owner { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
  .badge-deadline { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

  .btn-action-tool {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
  }

  .btn-emerald-glow {
    background: var(--emerald-primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .btn-outline-emerald {
    border: 1px solid var(--emerald-primary);
    color: var(--emerald-primary);
    background: transparent;
    border-radius: 10px;
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>