export type Pin = { text: string; isMarkdown: boolean }

declare module 'claude-code' {
  interface PluginState {
    'pin-message': { pins: Pin[] }
  }
}
