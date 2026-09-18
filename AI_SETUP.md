# RacharlaGPT Trend — Local AI

The current Trend Studio does **not** require Pollinations, an API key, a card, or user sign-in for AI generation.

It uses a browser-local diffusion engine through WebGPU. The AI model is downloaded to the visitor's browser and inference happens on the visitor's device. This is similar to current browser-local Stable Diffusion/WebGPU implementations documented by the open-source ecosystem.

## Important limitations

- A compatible WebGPU device/browser is required.
- The first model download can be very large and may take time.
- Integrated/mobile GPUs may be much slower or may run out of memory.
- The current local engine creates a **new AI trend image inspired by the reference workflow**; it is not an identity-preserving Flux/InstantID editor.
- The free counter is a user-experience courtesy limit, not a secure server-side quota.
- No AI provider secret is stored in GitHub Pages.

If local AI is unavailable, users can still use the Instant Effects and Image Tools.
