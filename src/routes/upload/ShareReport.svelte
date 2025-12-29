<button class="btn btn-outline-glass w-100 py-2 text-white" data-bs-toggle="modal" data-bs-target="#shareModal">
    <i class="fa-solid fa-share-nodes me-2"></i> Share Result
</button>

<div class="modal fade" id="shareModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content glass-card p-2 shadow-lg">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title text-white fw-bold">
          <i class="fa-solid fa-share-nodes me-2 text-indigo"></i>Share Analysis
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body">
        <div class="mb-4">
          <label class="text-light-muted small fw-bold mb-3 d-block">EXPORT OPTIONS</label>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-glass d-flex justify-content-between align-items-center py-2 px-3 disabled-feature">
              <span><i class="fa-solid fa-file-pdf me-2 text-danger"></i> Download as PDF</span>
              <span class="badge-soon">SOON</span>
            </button>
            
            <button class="btn btn-outline-glass d-flex justify-content-between align-items-center py-2 px-3 disabled-feature">
              <span><i class="fa-solid fa-image me-2 text-purple"></i> Download as PNG</span>
              <span class="badge-soon">SOON</span>
            </button>
          </div>
        </div>

        <hr class="border-glass my-4" />

        <div class="mb-2">
          <label class="text-light-muted small fw-bold mb-2 d-block">SEND VIA EMAIL</label>
          <p class="text-light-muted x-small mb-3">Analysis report will be sent as an interactive HTML link.</p>
          
          <div class="input-group">
            <input 
              type="email" 
              class="form-control form-control-custom" 
              placeholder="colleague@company.com" 
            />
            <button class="btn btn-indigo-glow px-3 disabled-feature" type="button">
              <i class="fa-solid fa-paper-plane me-2"></i>Send
            </button>
          </div>
          <div class="mt-2 text-end">
             <span class="text-purple x-small fw-bold opacity-75 uppercase-tracking">EMAIL SERVICE COMING SOON</span>
          </div>
        </div>
      </div>

      <div class="modal-footer border-0 pt-0">
        <button type="button" class="btn btn-outline-glass text-white w-100 py-2" data-bs-dismiss="modal">Back to Dashboard</button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Modal Content Specifics */
  .glass-card {
    background: #0e111d !important; /* var(--bg-dark-soft) */
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 20px;
  }

  .border-glass {
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  .x-small {
    font-size: 0.7rem;
  }

  .uppercase-tracking {
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* --- Coming Soon UI --- */
  .disabled-feature {
    cursor: not-allowed !important;
    opacity: 0.6;
    filter: grayscale(0.5);
  }

  .badge-soon {
    font-size: 0.6rem;
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7; /* var(--purple-primary) */
    border: 1px solid rgba(168, 85, 247, 0.4);
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 800;
  }

  /* --- Form Inputs --- */
  .form-control-custom {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    border-top-left-radius: 12px !important;
    border-bottom-left-radius: 12px !important;
    padding: 10px 15px;
  }

  .form-control-custom::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .form-control-custom:focus {
    border-color: #6366f1 !important; /* var(--indigo-primary) */
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  /* --- Button Styles --- */
  .btn-indigo-glow {
    background: #6366f1;
    color: white;
    border: none;
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  }

  .btn-outline-glass {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8; /* var(--text-muted) */
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .btn-outline-glass:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }
</style>