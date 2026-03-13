<script lang="ts">
  import { actions } from 'astro:actions';

  let submitting = $state(false);
  let submitted = $state(false);
  let serverError = $state('');
  let errors: Record<string, string> = $state({});

  let formEl: HTMLFormElement;

  function validate(data: FormData): boolean {
    const newErrors: Record<string, string> = {};

    const name = (data.get('name') as string)?.trim();
    const email = (data.get('email') as string)?.trim();
    const dealType = (data.get('dealType') as string)?.trim();
    const quantity = (data.get('quantity') as string)?.trim();
    const message = (data.get('message') as string)?.trim();

    if (!name) newErrors.name = 'Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!dealType) newErrors.dealType = 'Please select a deal type';
    if (!quantity) newErrors.quantity = 'Please select a quantity';
    if (!message || message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function clearError(field: string) {
    if (errors[field]) {
      errors = { ...errors, [field]: '' };
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    serverError = '';

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    if (!validate(data)) return;

    submitting = true;

    const { error } = await actions.submitInquiry(data);

    if (error) {
      submitting = false;
      serverError = error.message || 'Something went wrong. Please try again.';
      return;
    }

    submitting = false;
    submitted = true;
  }
</script>

{#if submitted}
  <div class="max-w-2xl mx-auto text-center py-12">
    <div class="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 class="text-2xl font-semibold text-navy mb-3">Thank you!</h2>
    <p class="text-slate/70">We'll be in touch within 1 business day.</p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="max-w-2xl mx-auto" bind:this={formEl} novalidate>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-semibold text-navy mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          autocomplete="name"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
          oninput={() => clearError('name')}
        />
        {#if errors.name}
          <p class="text-red-600 text-sm mt-1">{errors.name}</p>
        {/if}
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-navy mb-1">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autocomplete="email"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
          oninput={() => clearError('email')}
        />
        {#if errors.email}
          <p class="text-red-600 text-sm mt-1">{errors.email}</p>
        {/if}
      </div>

      <!-- Company -->
      <div>
        <label for="company" class="block text-sm font-semibold text-navy mb-1">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          autocomplete="organization"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
        />
      </div>

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-sm font-semibold text-navy mb-1">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autocomplete="tel"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
        />
      </div>

      <!-- Deal Type -->
      <div>
        <label for="dealType" class="block text-sm font-semibold text-navy mb-1">
          Deal Type <span class="text-red-500">*</span>
        </label>
        <select
          id="dealType"
          name="dealType"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors bg-white"
          onchange={() => clearError('dealType')}
        >
          <option value="">Select a deal type</option>
          <option value="M&A / Acquisition">M&A / Acquisition</option>
          <option value="IPO">IPO</option>
          <option value="Debt Financing">Debt Financing</option>
          <option value="Private Equity">Private Equity</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Other">Other</option>
        </select>
        {#if errors.dealType}
          <p class="text-red-600 text-sm mt-1">{errors.dealType}</p>
        {/if}
      </div>

      <!-- Quantity -->
      <div>
        <label for="quantity" class="block text-sm font-semibold text-navy mb-1">
          Quantity <span class="text-red-500">*</span>
        </label>
        <select
          id="quantity"
          name="quantity"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors bg-white"
          onchange={() => clearError('quantity')}
        >
          <option value="">Select quantity</option>
          <option value="1-5">1-5</option>
          <option value="6-15">6-15</option>
          <option value="16-50">16-50</option>
          <option value="50+">50+</option>
        </select>
        {#if errors.quantity}
          <p class="text-red-600 text-sm mt-1">{errors.quantity}</p>
        {/if}
      </div>

      <!-- Deadline -->
      <div class="sm:col-span-2">
        <label for="deadline" class="block text-sm font-semibold text-navy mb-1">Deadline</label>
        <input
          type="text"
          id="deadline"
          name="deadline"
          placeholder="e.g., Q2 2026"
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors placeholder:text-slate/40"
        />
      </div>

      <!-- Message -->
      <div class="sm:col-span-2">
        <label for="message" class="block text-sm font-semibold text-navy mb-1">
          Message <span class="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows="5"
          placeholder="Tell us about your deal and what you have in mind..."
          class="w-full rounded border border-gray-300 px-4 py-3 text-slate focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors placeholder:text-slate/40 resize-y"
          oninput={() => clearError('message')}
        ></textarea>
        {#if errors.message}
          <p class="text-red-600 text-sm mt-1">{errors.message}</p>
        {/if}
      </div>
    </div>

    {#if serverError}
      <p class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded border border-red-200">{serverError}</p>
    {/if}

    <div class="mt-8">
      <button
        type="submit"
        disabled={submitting}
        class="w-full bg-gold text-navy font-semibold py-3 px-8 rounded hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending...' : 'Send Inquiry'}
      </button>
    </div>
  </form>
{/if}
