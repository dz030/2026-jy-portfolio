import { defineConfig } from "vite";
import htmlInject from "vite-plugin-html-inject";
import { resolve } from "path";

export default defineConfig({
  base: "/",
  plugins: [htmlInject()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),

        aiMotionGraphic: resolve(__dirname, "projects/ai-driven/ai-motion-graphic.html"),
        influencerTool: resolve(__dirname, "projects/ai-driven/influencer-tool.html"),
        intelligentFulfillment: resolve(__dirname, "projects/ai-driven/intelligent-fulfillment-system.html"),

        fashionWebUI: resolve(__dirname, "projects/digital-visual/fashion-web-ui-design.html"),
        webBanners: resolve(__dirname, "projects/digital-visual/web-banners-newsletters.html"),

        b2bOrderApp: resolve(__dirname, "projects/product-ux/b2b-order-app.html"),
        b2bWebsite: resolve(__dirname, "projects/product-ux/b2b-website-redesign.html"),
        dtcWebsite: resolve(__dirname, "projects/product-ux/dtc-website-redesign.html"),
        nearbiewApp: resolve(__dirname, "projects/product-ux/nearbiew-app.html"),
        shopifyPOS: resolve(__dirname, "projects/product-ux/shopify-pos-migration.html"),
      }
    }
  }
});