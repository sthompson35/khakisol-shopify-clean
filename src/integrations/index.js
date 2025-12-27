/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    🔌 INTEGRATIONS INDEX                         ║
 * ║              All External Service Integrations                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export { default as NotionClient } from './notion.js';
export { default as SlackClient } from './slack.js';
export { default as OllamaClient } from './ollama.js';
export { default as OpenRouterClient } from './openrouter.js';

// Quick access to all integrations
import NotionClient from './notion.js';
import SlackClient from './slack.js';
import OllamaClient from './ollama.js';
import OpenRouterClient from './openrouter.js';

export function createIntegrations() {
    return {
        notion: new NotionClient(),
        slack: new SlackClient(),
        ollama: new OllamaClient(),
        openrouter: new OpenRouterClient()
    };
}

export default { NotionClient, SlackClient, OllamaClient, OpenRouterClient, createIntegrations };
