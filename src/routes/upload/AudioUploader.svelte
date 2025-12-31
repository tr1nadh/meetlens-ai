<script>
  import FilePond, { registerPlugin } from 'svelte-filepond';
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
  import { createEventDispatcher } from 'svelte';

  registerPlugin(FilePondPluginFileValidateType);

  const dispatch = createEventDispatcher();
  const acceptedAudioTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/x-m4a'];
  
  let pond;
  let fileName = ""; 
  let localError = ""; 

  function handleButtonClick() {
    localError = ""; // Clear error when opening the picker
    pond.browse();
  }

  function handleAddFile(error, fileItem) {
    if (error) {
      localError = "MP4 not allowed. Please select MP3, WAV, or M4A.";
      dispatch('error', localError);
      if (pond) pond.removeFiles();
      return;
    }

    const fileObject = fileItem.file;
    const objectUrl = URL.createObjectURL(fileObject);
    
    const audio = new Audio(objectUrl);
    audio.onloadedmetadata = () => {
      if (audio.duration > 1800) { 
        localError = "File too long. Maximum 30 minutes allowed.";
        dispatch('error', localError);
        
        // IMPORTANT: Clear the file from pond, but DON'T clear localError
        if (pond) pond.removeFiles();
        fileName = "";
        dispatch('fileCleared');
      } else {
        fileName = fileObject.name;
        localError = ""; 
        dispatch('fileSelected', { file: fileObject, url: objectUrl });
      }
    };

    audio.onerror = () => {
        localError = "Could not read audio file.";
        dispatch('error', localError);
        if (pond) pond.removeFiles();
        fileName = "";
    };
  }

  // Use this for the manual "X" button click
    export function clearFile() {
        if (pond) pond.removeFiles();
        fileName = "";
        localError = "";
    }

  export function setFile(newFile) {
      if (pond) {
        // This triggers handleAddFile automatically
        pond.addFile(newFile);
      }
    }
</script>

<div class="custom-uploader">
  {#if !fileName}
    <button 
      type="button" 
      class="btn btn-indigo-glow w-100 py-2 d-flex align-items-center justify-content-center"
      on:click={handleButtonClick}>
      <i class="fa-solid fa-cloud-arrow-up me-2"></i>
      Choose Audio
    </button>
  {:else}
    <div class="d-flex gap-2">
      <button class="btn btn-outline-glass flex-grow-1 text-truncate" disabled title={fileName}>
        <i class="fa-solid fa-file-audio me-2 text-indigo"></i>
        {fileName}
      </button>
    </div>
  {/if}

  {#if localError}
    <div class="error-text">
      <i class="fa-solid fa-triangle-exclamation me-1"></i>
      {localError}
    </div>
  {/if}

  <div class="pond-hidden-logic">
    <FilePond
      bind:this={pond}
      acceptedFileTypes={acceptedAudioTypes}
      allowFileTypeValidation={true}
      allowMultiple={false}
      allowCredits={false}
      onaddfile={handleAddFile}
    />
  </div>
</div>

<style>
  .pond-hidden-logic { display: none !important; }

  .btn-indigo-glow {
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn-indigo-glow:hover { background: #4f46e5; }

  .error-text {
    color: #ff4d4d;
    font-size: 0.75rem;
    margin-top: 8px;
    font-weight: 500;
    text-align: center;
    animation: shake 0.4s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .btn-outline-glass {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem;
  }

  .text-indigo { color: #6366f1; }

  .btn-danger-soft {
    background: rgba(220, 38, 38, 0.1);
    color: #ef4444;
    border-radius: 12px;
    width: 45px;
    border: 1px solid rgba(220, 38, 38, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-danger-soft:hover {
    background: #ef4444;
    color: white;
  }
</style>