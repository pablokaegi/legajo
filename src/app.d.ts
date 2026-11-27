// Tipos globales de la app SvelteKit
// Ver: https://kit.svelte.dev/docs/types#app

import type { SessionUser } from '$lib/server/session';

declare global {
  namespace App {
    interface Locals {
      usuario: SessionUser | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    interface Error {
      message: string;
    }
  }
}

export {};
