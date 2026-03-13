<script lang="ts">
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails } from "svelte-inview";

  interface Props {
    threshold?: number;
    delay?: number;
    animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right";
    children?: import("svelte").Snippet;
  }

  let {
    threshold = 0.2,
    delay = 0,
    animation = "fade-up",
    children,
  }: Props = $props();

  let isVisible = $state(false);

  function handleInview(event: CustomEvent<ObserverEventDetails>) {
    if (event.detail.inView) {
      isVisible = true;
    }
  }
</script>

<div
  use:inview={{ threshold }}
  oninview_enter={handleInview}
  class="scroll-reveal {animation}"
  class:visible={isVisible}
  style="transition-delay: {delay}ms"
>
  {@render children?.()}
</div>

<style>
  .scroll-reveal {
    transition: opacity 0.7s ease-out, transform 0.7s ease-out;
  }

  .scroll-reveal.fade-up {
    opacity: 0;
    transform: translateY(2rem);
  }
  .scroll-reveal.fade-in {
    opacity: 0;
  }
  .scroll-reveal.fade-left {
    opacity: 0;
    transform: translateX(-2rem);
  }
  .scroll-reveal.fade-right {
    opacity: 0;
    transform: translateX(2rem);
  }

  .scroll-reveal.visible {
    opacity: 1;
    transform: translate(0, 0);
  }
</style>
