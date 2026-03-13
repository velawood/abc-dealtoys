<script lang="ts">
  let isOpen = $state(false);

  function toggle() {
    isOpen = !isOpen;
  }

  function close() {
    isOpen = false;
  }
</script>

<div>
  <!-- Hamburger button — visible on mobile only -->
  <button
    class="md:hidden flex flex-col justify-center items-center gap-[5px] min-w-[44px] min-h-[44px] text-white"
    onclick={toggle}
    aria-label="Open menu"
    aria-expanded={isOpen}
    aria-controls="mobile-nav-overlay"
  >
    <span class="block w-6 h-0.5 bg-current transition-all duration-200"></span>
    <span class="block w-6 h-0.5 bg-current transition-all duration-200"></span>
    <span class="block w-6 h-0.5 bg-current transition-all duration-200"></span>
  </button>

  <!-- Full-screen overlay -->
  {#if isOpen}
    <div
      id="mobile-nav-overlay"
      class="fixed inset-0 z-50 bg-navy flex flex-col items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <!-- Close button -->
      <button
        class="absolute top-4 right-4 flex items-center justify-center min-w-[44px] min-h-[44px] text-white"
        onclick={close}
        aria-label="Close menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Nav links -->
      <nav class="flex flex-col items-center gap-10">
        <a href="/products" onclick={close} class="text-white text-2xl font-medium hover:text-gold transition-colors duration-200">
          Shop
        </a>
        <a href="/how-it-works" onclick={close} class="text-white text-2xl font-medium hover:text-gold transition-colors duration-200">
          How It Works
        </a>
        <a href="/about" onclick={close} class="text-white text-2xl font-medium hover:text-gold transition-colors duration-200">
          Our Story
        </a>
        <a href="/contact" onclick={close} class="text-white text-2xl font-medium hover:text-gold transition-colors duration-200">
          Get a Quote
        </a>
      </nav>
    </div>
  {/if}
</div>
