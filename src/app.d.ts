// Tipos globales de la app SvelteKit
// Ver: https://kit.svelte.dev/docs/types#app

declare global {
  namespace App {
    interface Locals {
      docente: {
        docenteId: number;
        email: string;
        nombre: string;
      } | null;
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
