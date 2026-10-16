/**
 * Cloudflare Worker for Volante Express (volanteexpress.com.br)
 * Handles Agentic Content Negotiation (Accept: text/markdown) and Agent-Friendly 404s at the Edge.
 * 
 * Deployment:
 * 1. Cloudflare Dashboard > Workers & Pages > Create Application > Create Worker
 * 2. Paste this code.
 * 3. Add Custom Domain or Route: volanteexpress.com.br/*
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";
    const wantsMarkdown = accept.toLowerCase().includes("text/markdown");

    // Homepage Content Negotiation
    if (url.pathname === "/" || url.pathname === "") {
      if (wantsMarkdown) {
        const mdUrl = new URL("/index.md", request.url);
        const mdRes = await fetch(mdUrl);
        if (mdRes.ok) {
          const headers = new Headers(mdRes.headers);
          headers.set("Content-Type", "text/markdown; charset=utf-8");
          headers.set("Vary", "Accept");
          return new Response(mdRes.body, { status: 200, headers });
        }
      } else {
        const res = await fetch(request);
        const headers = new Headers(res.headers);
        headers.set("Vary", "Accept");
        return new Response(res.body, { status: res.status, headers });
      }
    }

    // Trust Anchor Pages Negotiation (/about, /contact, /privacy)
    const trustPages = ["/about", "/contact", "/privacy"];
    if (trustPages.includes(url.pathname)) {
      if (wantsMarkdown) {
        const mdUrl = new URL(`${url.pathname}.md`, request.url);
        const mdRes = await fetch(mdUrl);
        if (mdRes.ok) {
          const headers = new Headers(mdRes.headers);
          headers.set("Content-Type", "text/markdown; charset=utf-8");
          headers.set("Vary", "Accept");
          return new Response(mdRes.body, { status: 200, headers });
        }
      }
    }

    // Fetch original resource from origin server
    const response = await fetch(request);

    // Agent-Friendly 404 Negotiation
    if (response.status === 404 && wantsMarkdown) {
      const markdown404 = `# 404 - Página Não Encontrada | Volante Express

O recurso solicitado não foi encontrado no domínio volanteexpress.com.br.

## Links e Recursos Úteis:
- [Página Inicial](https://volanteexpress.com.br/)
- [Guia para Agentes de IA (llms.txt)](https://volanteexpress.com.br/llms.txt)
- [Mapa do Site (Sitemap XML)](https://volanteexpress.com.br/sitemap.xml)
- [Sobre a Volante Express](https://volanteexpress.com.br/about)
- [Contato e Agendamento](https://volanteexpress.com.br/contact)

WhatsApp Oficial: +55 (31) 99629-4103
`;
      return new Response(markdown404, {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Vary": "Accept"
        }
      });
    }

    return response;
  }
};
