<script lang="ts">
  interface Props {
    onchange?: (data: { attributes: Array<{key: string; value: string}>; isValid: boolean }) => void;
  }

  let { onchange }: Props = $props();

  let dealName = $state('');
  let parties = $state('');
  let dealType = $state('');
  let amount = $state('');
  let closeDate = $state('');

  let isValid = $derived(
    dealName.trim().length >= 2 &&
    parties.trim().length >= 2 &&
    dealType !== '' &&
    amount.trim().length >= 1 &&
    closeDate.trim().length > 0
  );

  $effect(() => {
    const attributes = [
      { key: 'Deal Name', value: dealName },
      { key: 'Parties Involved', value: parties },
      { key: 'Deal Type', value: dealType },
      { key: 'Amount', value: amount },
      { key: 'Close Date', value: closeDate },
    ];
    onchange?.({ attributes, isValid });
  });

  const inputClass = "w-full rounded-sm border border-navy/20 bg-white px-3 py-2.5 text-slate placeholder:text-navy/30 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors";
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold text-navy mb-4">Customize Your Deal Toy</h3>

  <div class="space-y-1.5">
    <label class="block text-sm font-semibold uppercase tracking-wider text-navy" for="deal-name">
      Deal Name
    </label>
    <input
      id="deal-name"
      type="text"
      class={inputClass}
      placeholder="e.g., Project Atlas Acquisition"
      bind:value={dealName}
    />
  </div>

  <div class="space-y-1.5">
    <label class="block text-sm font-semibold uppercase tracking-wider text-navy" for="parties">
      Parties Involved
    </label>
    <input
      id="parties"
      type="text"
      class={inputClass}
      placeholder="e.g., Buyer Corp & Seller Inc."
      bind:value={parties}
    />
  </div>

  <div class="space-y-1.5">
    <label class="block text-sm font-semibold uppercase tracking-wider text-navy" for="deal-type">
      Deal Type
    </label>
    <select
      id="deal-type"
      class={inputClass}
      bind:value={dealType}
    >
      <option value="">Select deal type</option>
      <option value="M&A">M&amp;A</option>
      <option value="IPO">IPO</option>
      <option value="Debt Financing">Debt Financing</option>
      <option value="Equity Offering">Equity Offering</option>
      <option value="Private Placement">Private Placement</option>
      <option value="Restructuring">Restructuring</option>
      <option value="Other">Other</option>
    </select>
  </div>

  <div class="space-y-1.5">
    <label class="block text-sm font-semibold uppercase tracking-wider text-navy" for="amount">
      Amount
    </label>
    <input
      id="amount"
      type="text"
      class={inputClass}
      placeholder="e.g., $2.5 Billion"
      bind:value={amount}
    />
  </div>

  <div class="space-y-1.5">
    <label class="block text-sm font-semibold uppercase tracking-wider text-navy" for="close-date">
      Close Date
    </label>
    <input
      id="close-date"
      type="date"
      class={inputClass}
      bind:value={closeDate}
    />
  </div>

  <p class="text-xs text-navy/50 mt-3">All fields are required for personalization.</p>
</div>
