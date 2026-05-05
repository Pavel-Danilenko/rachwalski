import type { AstroIntegration } from "astro";
import {
   readFileSync,
   writeFileSync,
   readdirSync,
   mkdirSync,
   copyFileSync,
   existsSync,
} from "fs";
import { join, extname } from "path";
import { parse } from "node-html-parser";

export function shopifyIntegration(): AstroIntegration {
   return {
      name: "shopify-transform",
      hooks: {
         "astro:build:done": async ({ dir }) => {
            const outDir = dir.pathname;
            const themeDir = join(outDir, "_theme");

            const dirs = [
               join(themeDir, "layout"),
               join(themeDir, "templates"),
               join(themeDir, "sections"),
               join(themeDir, "snippets"),
               join(themeDir, "assets"),
               join(themeDir, "config"),
               join(themeDir, "locales"),
            ];
            dirs.forEach((d) => mkdirSync(d, { recursive: true }));

            const htmlFiles = findHtmlFiles(outDir, outDir);
            console.log(
               `\n🛍️  Shopify build: знайдено ${htmlFiles.length} сторінок`,
            );

            copyAssets(outDir, join(themeDir, "assets"));

            const allScripts = new Set<string>();
            const allStyles = new Set<string>();

            for (const { file } of htmlFiles) {
               const html = readFileSync(file, "utf-8");
               const root = parse(html);

               for (const el of root.querySelectorAll("script[src]")) {
                  const src = el.getAttribute("src") ?? "";
                  const fileName = src.split("/").pop();
                  if (fileName) allScripts.add(fileName);
               }
               for (const el of root.querySelectorAll(
                  'link[rel="stylesheet"]',
               )) {
                  const href = el.getAttribute("href") ?? "";
                  const fileName = href.split("/").pop();
                  if (fileName) allStyles.add(fileName);
               }
            }

            const indexPage = htmlFiles.find((f) => f.templateName === "index");
            if (indexPage) {
               const html = readFileSync(indexPage.file, "utf-8");
               const root = parse(html);
               const layoutLiquid = generateLayout(
                  root,
                  themeDir,
                  allScripts,
                  allStyles,
               );
               writeFileSync(
                  join(themeDir, "layout", "theme.liquid"),
                  layoutLiquid,
               );
               console.log("✅ layout/theme.liquid");
            }

            for (const { file, templateName, sfTemplate } of htmlFiles) {
               const html = readFileSync(file, "utf-8");
               const root = parse(html);
               const main =
                  root.querySelector("main") ?? root.querySelector("body");

               if (!main) continue;

               // Прибираємо sf-template атрибут щоб не потрапив в liquid
               const templateEl = root.querySelector("[sf-template]");
               if (templateEl) templateEl.removeAttribute("sf-template");

               const globalSectionNames = new Set(
                  root
                     .querySelectorAll("[sf-global][sf-section]")
                     .map((el: any) => el.getAttribute("sf-section")),
               );

               const sfSections = main.querySelectorAll("[sf-section]");

               if (sfSections.length > 0) {
                  const sectionNames: string[] = [];
                  const sectionPresets: Record<string, any[]> = {};

                  for (const sectionEl of sfSections) {
                     const sectionName = (sectionEl.getAttribute("sf-section")!).replace(/\./g, "-");
                     if (globalSectionNames.has(sectionName)) continue;
                     sectionEl.removeAttribute("sf-section");

                     const { sectionLiquid, presetBlocks } = generateSection(sectionEl, sectionName);
                     writeFileSync(join(themeDir, "sections", `${sectionName}.liquid`), sectionLiquid);
                     console.log(`✅ sections/${sectionName}.liquid`);
                     sectionNames.push(sectionName);
                     if (presetBlocks.length) sectionPresets[sectionName] = presetBlocks;
                  }

                  const templateJson = generateTemplateJson(sectionNames, sectionPresets);
                  writeFileSync(join(themeDir, "templates", `${templateName}.json`), templateJson);
                  console.log(`✅ templates/${templateName}.json`);
               } else {
                  const sectionName =
                     templateName === "index" ? "home" : templateName.replace(/\./g, "-");
                  const { sectionLiquid, presetBlocks } = generateSection(main, sectionName);
                  writeFileSync(join(themeDir, "sections", `${sectionName}.liquid`), sectionLiquid);
                  console.log(`✅ sections/${sectionName}.liquid`);

                  const sectionPresets: Record<string, any[]> = {};
                  if (presetBlocks.length) sectionPresets[sectionName] = presetBlocks;
                  const templateJson = generateTemplateJson([sectionName], sectionPresets);
                  writeFileSync(join(themeDir, "templates", `${templateName}.json`), templateJson);
                  console.log(`✅ templates/${templateName}.json`);
               }
            }

            generateConfig(themeDir);
            console.log(`\n🎉 Тема готова: ${themeDir}\n`);
         },
      },
   };
}

function generateLayout(
   root: any,
   themeDir: string,
   allScripts: Set<string>,
   allStyles: Set<string>,
): string {
   const styleLinks = Array.from(allStyles)
      .map(
         (fileName) =>
            `<link rel="stylesheet" href="{{ '${fileName}' | asset_url }}">`,
      )
      .join("\n    ");

   const scriptTags = Array.from(allScripts)
      .map(
         (fileName) =>
            `<script type="module" src="{{ '${fileName}' | asset_url }}" defer></script>`,
      )
      .join("\n    ");

   const mainEl = root.querySelector("main");

   let iconSpriteTag = "";
   const svgSprite = root.querySelector(
      'svg[style*="display:none"], svg[style*="display: none"]',
   );
   if (svgSprite) {
      const spriteHtml = svgSprite.outerHTML;
      writeFileSync(
         join(themeDir, "snippets", "icon-sprite.liquid"),
         spriteHtml,
      );
      svgSprite.replaceWith(`{% render 'icon-sprite' %}`);
      iconSpriteTag = `{% render 'icon-sprite' %}`;
      console.log("✅ snippets/icon-sprite.liquid");
   }

   const allSfSections = root.querySelectorAll("[sf-section]");
   for (const sectionEl of allSfSections) {
      const sectionName = sectionEl.getAttribute("sf-section")!;
      if (mainEl && mainEl.querySelector(`[sf-section="${sectionName}"]`))
         continue;

      sectionEl.removeAttribute("sf-section");
      sectionEl.removeAttribute("sf-global");
      const { sectionLiquid } = generateSection(sectionEl, sectionName);
      writeFileSync(
         join(themeDir, "sections", `${sectionName}.liquid`),
         sectionLiquid,
      );
      console.log(`✅ sections/${sectionName}.liquid (layout)`);
      sectionEl.replaceWith(`{% section '${sectionName}' %}`);
   }

   if (mainEl) {
      mainEl.set_content("{{ content_for_layout }}");
   }

   const wrapper = root.querySelector(".wrapper");
   const wrapperHtml = wrapper?.innerHTML ?? "{{ content_for_layout }}";

   const body = root.querySelector("body");
   let outsideWrapper = "";
   if (body) {
      for (const node of body.childNodes) {
         const cls = node.getAttribute?.("class") ?? "";
         if (cls.includes("wrapper")) continue;
         if (node.tagName?.toLowerCase() === "script") continue;
         if (
            node.outerHTML?.includes("display:none") ||
            node.outerHTML?.includes("display: none")
         )
            continue;
         outsideWrapper += node.outerHTML ?? "";
      }
   }

   return `<!doctype html>
<html lang="{{ shop.locale }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page_title }} | {{ shop.name }}</title>
    <meta name="description" content="{{ page_description }}">
    <link rel="icon" href="{{ 'favicon.svg' | asset_url }}" type="image/svg+xml">
    ${styleLinks}
    ${scriptTags}
    {{ content_for_header }}
  </head>
  <body>
    ${iconSpriteTag}
    <div class="wrapper">
      ${wrapperHtml}
    </div>
    ${outsideWrapper}
  </body>
</html>
`;
}

// ── SHOPIFY FIELDS MAP ────────────────────────────────────────────────────────
const SHOPIFY_FIELDS: Record<
   string,
   Record<string, { attr?: string; liquid: string }>
> = {
   products: {
      image: {
         attr: "src",
         liquid: `{{ product.featured_image | image_url: width: 800, format: 'webp' }}`,
      },
      title: { liquid: `{{ product.title }}` },
      price: { liquid: `{{ product.selected_or_first_available_variant.price | money }}` },
      compare_price: {
         liquid: `{% assign _pv = product.selected_or_first_available_variant %}{% if _pv.compare_at_price > _pv.price %}{{ _pv.compare_at_price | money }}{% endif %}`,
      },
      url: { attr: "href", liquid: `{{ product.url | within: collection }}` },
      collection_url: { attr: "href", liquid: `{{ product.collections.first.url }}` },
      description: { liquid: `{{ product.description }}` },
      vendor: { liquid: `{{ product.vendor }}` },
   },
   blog: {
      image: {
         attr: "src",
         liquid: `{{ article.image | image_url: width: 800, format: 'webp' }}`,
      },
      title: { liquid: `{{ article.title }}` },
      excerpt: { liquid: `{{ article.excerpt }}` },
      date: { liquid: `{{ article.published_at | date: '%d.%m.%Y' }}` },
      url: { attr: "href", liquid: `{{ article.url | locale_url }}` },
      author: { liquid: `{{ article.author }}` },
   },
   collections: {
      image: {
         attr: "src",
         liquid: `{{ collection.image | image_url: width: 800, format: 'webp' }}`,
      },
      title: { liquid: `{{ collection.title }}` },
      description: { liquid: `{{ collection.description }}` },
      url: { attr: "href", liquid: `{{ collection.url | locale_url }}` },
   },
   // collection_products — всі товари колекції (без ліміту, для пагінації)
   collection_products: {
      image: {
         attr: "src",
         liquid: `{{ product.featured_image | image_url: width: 800, format: 'webp' }}`,
      },
      title: { liquid: `{{ product.title }}` },
      price: { liquid: `{{ product.selected_or_first_available_variant.price | money }}` },
      compare_price: {
         liquid: `{% assign _pv = product.selected_or_first_available_variant %}{% if _pv.compare_at_price > _pv.price %}{{ _pv.compare_at_price | money }}{% endif %}`,
      },
      url: { attr: "href", liquid: `{{ product.url | within: collection }}` },
      description: { liquid: `{{ product.description }}` },
      vendor: { liquid: `{{ product.vendor }}` },
   },
   // collection_variants — кожен варіант як окрема картка (для фільтрованої колекції)
   collection_variants: {
      image: {
         attr: "src",
         liquid: `{{ variant.featured_image.src | default: product.featured_image | image_url: width: 800, format: 'webp' }}`,
      },
      title: {
         liquid: `{{ product.title }}{% unless product.has_only_default_variant %} — {{ variant.title }}{% endunless %}`,
      },
      price: { liquid: `{{ variant.price | money }}` },
      compare_price: {
         liquid: `{% if variant.compare_at_price > variant.price %}{{ variant.compare_at_price | money }}{% endif %}`,
      },
      url: { attr: "href", liquid: `{{ product.url }}?variant={{ variant.id }}` },
      short_description: { liquid: `{{ product.description | strip_html | truncate: section.settings.card_desc_length }}` },
      sale_badge_image: { liquid: `{%- if section.settings.card_sale_badge and variant.compare_at_price > variant.price and section.settings.card_sale_badge_position == "image" -%}<span class="collection-card__badge collection-card__badge--sale">{%- if section.settings.card_badge_type == "percent" -%}{{ variant.compare_at_price | minus: variant.price | times: 100.0 | divided_by: variant.compare_at_price | round | prepend: "-" | append: "%" }}{%- else -%}{{ section.settings.card_sale_badge_text | default: 'SALE' }}{%- endif -%}</span>{%- endif -%}` },
      sale_badge_price: { liquid: `{%- if section.settings.card_sale_badge and variant.compare_at_price > variant.price and section.settings.card_sale_badge_position == "price" -%}<span class="collection-card__badge collection-card__badge--sale collection-card__badge--inline">{%- if section.settings.card_badge_type == "percent" -%}{{ variant.compare_at_price | minus: variant.price | times: 100.0 | divided_by: variant.compare_at_price | round | prepend: "-" | append: "%" }}{%- else -%}{{ section.settings.card_sale_badge_text | default: 'SALE' }}{%- endif -%}</span>{%- endif -%}` },
      tags_badge_image: { liquid: `{%- if section.settings.card_show_tags and section.settings.card_badge_position == "image" -%}{%- assign _stags = section.settings.card_tag_labels | downcase | split: "," -%}{%- for _tag in product.tags -%}{%- assign _t = _tag | downcase | strip -%}{%- if _stags contains _t -%}<span class="collection-card__tag collection-card__tag--{{ _t | handleize }}">{{ _tag }}</span>{%- endif -%}{%- endfor -%}{%- if variant.metafields.custom.badge != blank -%}{%- for _mb in variant.metafields.custom.badge.value -%}<span class="collection-card__tag collection-card__tag--{{ _mb | downcase | strip | handleize }}">{{ _mb }}</span>{%- endfor -%}{%- endif -%}{%- endif -%}` },
      tags_badge_info: { liquid: `{%- if section.settings.card_show_tags and section.settings.card_badge_position == "info" -%}{%- assign _stags = section.settings.card_tag_labels | downcase | split: "," -%}{%- for _tag in product.tags -%}{%- assign _t = _tag | downcase | strip -%}{%- if _stags contains _t -%}<span class="collection-card__tag collection-card__tag--{{ _t | handleize }}">{{ _tag }}</span>{%- endif -%}{%- endfor -%}{%- if variant.metafields.custom.badge != blank -%}{%- for _mb in variant.metafields.custom.badge.value -%}<span class="collection-card__tag collection-card__tag--{{ _mb | downcase | strip | handleize }}">{{ _mb }}</span>{%- endfor -%}{%- endif -%}{%- endif -%}` },
   },
   // featured_products — ручний вибір товарів через block product picker (homepage slider)
   // slide_variant — конкретний варіант (з variant_title) або перший доступний (fallback)
   featured_products: {
      image: {
         attr: "src",
         liquid: `{{ slide_variant.featured_image | default: product.featured_image | image_url: width: 800, format: 'webp' }}`,
      },
      title: { liquid: `{{ product.title }}{% unless product.has_only_default_variant %} — {{ slide_variant.title }}{% endunless %}` },
      price: { liquid: `{{ slide_variant.price | money }}` },
      compare_price: {
         liquid: `{% if slide_variant.compare_at_price > slide_variant.price %}{{ slide_variant.compare_at_price | money }}{% endif %}`,
      },
      url: { attr: "href", liquid: `{{ product.url }}?variant={{ slide_variant.id }}` },
      vendor: { liquid: `{{ product.vendor }}` },
      variant_title: { liquid: `` },
      variants_hint: { liquid: `{%- unless product.has_only_default_variant -%}{%- if request.design_mode -%}<div class="product-slide__variants-hint"><span>👆 Click → auto-fills "Variant title":</span>{%- for _v in product.variants -%}<button type="button" class="product-slide__variants-hint-btn{% if _v.id == slide_variant.id %} is-active{% endif %}" data-sf-variant="{{ _v.title }}">{{ _v.title }}</button>{%- endfor -%}</div>{%- endif -%}{%- endunless -%}` },
      short_description: { liquid: `{%- if section.settings.slide_show_desc -%}{{ product.description | strip_html | truncate: section.settings.slide_desc_length }}{%- endif -%}` },
      sale_badge_image: { liquid: `{%- if section.settings.slide_show_badge and slide_variant.compare_at_price > slide_variant.price and section.settings.slide_badge_position == "image" -%}<span class="product-slide__badge">{%- if section.settings.slide_badge_type == "percent" -%}{{ slide_variant.compare_at_price | minus: slide_variant.price | times: 100.0 | divided_by: slide_variant.compare_at_price | round | prepend: "-" | append: "%" }}{%- else -%}{{ section.settings.slide_badge_text | default: "SALE" }}{%- endif -%}</span>{%- endif -%}` },
      sale_badge_price: { liquid: `{%- if section.settings.slide_show_badge and slide_variant.compare_at_price > slide_variant.price and section.settings.slide_badge_position == "price" -%}<span class="product-slide__badge product-slide__badge--inline">{%- if section.settings.slide_badge_type == "percent" -%}{{ slide_variant.compare_at_price | minus: slide_variant.price | times: 100.0 | divided_by: slide_variant.compare_at_price | round | prepend: "-" | append: "%" }}{%- else -%}{{ section.settings.slide_badge_text | default: "SALE" }}{%- endif -%}</span>{%- endif -%}` },
      card_order_style: { attr: "style", liquid: `--slide-title-order:{{ section.settings.slide_order_title }};--slide-desc-order:{{ section.settings.slide_order_desc }};--slide-price-order:{{ section.settings.slide_order_price }};--slide-btn-order:{{ section.settings.slide_order_btn }}` },
      slide_img_ratio_style: { attr: "style", liquid: `--slide-img-ratio-desktop:{{ section.settings.slide_img_ratio_desktop | default: '4/3' }};--slide-img-ratio-tablet:{{ section.settings.slide_img_ratio_tablet | default: '4/3' }};--slide-img-ratio-mobile:{{ section.settings.slide_img_ratio_mobile | default: '1/1' }}` },
      slide_tags_badge_image: { liquid: `{%- if section.settings.slide_show_tags and section.settings.slide_tag_badge_position == "image" -%}{%- assign _stags = section.settings.slide_tag_labels | downcase | split: "," -%}{%- for _tag in product.tags -%}{%- assign _t = _tag | downcase | strip -%}{%- if _stags contains _t -%}<span class="product-slide__tag product-slide__tag--{{ _t | handleize }}">{{ _tag }}</span>{%- endif -%}{%- endfor -%}{%- if slide_variant.metafields.custom.badge != blank -%}{%- for _mb in slide_variant.metafields.custom.badge.value -%}<span class="product-slide__tag product-slide__tag--{{ _mb | downcase | strip | handleize }}">{{ _mb }}</span>{%- endfor -%}{%- endif -%}{%- endif -%}` },
      slide_tags_badge_info: { liquid: `{%- if section.settings.slide_show_tags and section.settings.slide_tag_badge_position == "info" -%}{%- assign _stags = section.settings.slide_tag_labels | downcase | split: "," -%}{%- for _tag in product.tags -%}{%- assign _t = _tag | downcase | strip -%}{%- if _stags contains _t -%}<span class="product-slide__tag product-slide__tag--{{ _t | handleize }}">{{ _tag }}</span>{%- endif -%}{%- endfor -%}{%- if slide_variant.metafields.custom.badge != blank -%}{%- for _mb in slide_variant.metafields.custom.badge.value -%}<span class="product-slide__tag product-slide__tag--{{ _mb | downcase | strip | handleize }}">{{ _mb }}</span>{%- endfor -%}{%- endif -%}{%- endif -%}` },
   },
};

// Liquid loop для кожного джерела
const SOURCE_LOOP: Record<string, { open: string; close: string }> = {
   products: {
      open: `{%- for product in collection.products limit: section.settings.source_limit -%}`,
      close: `{%- endfor -%}`,
   },
   blog: {
      open: `{%- for article in blog.articles limit: section.settings.source_limit -%}`,
      close: `{%- endfor -%}`,
   },
   collections: {
      open: `{%- for collection in collections limit: section.settings.source_limit -%}`,
      close: `{%- endfor -%}`,
   },
   // Всі товари колекції — без ліміту (ліміт керується JS-пагінацією)
   collection_products: {
      open: `{%- for product in collection.products -%}`,
      close: `{%- endfor -%}`,
   },
   // Кожен варіант як окрема картка — подвійний цикл
   collection_variants: {
      open: `{%- for product in collection.products -%}{%- for variant in product.variants -%}`,
      close: `{%- endfor -%}{%- endfor -%}`,
   },
   // featured_products — ітерація по blocks (кожен block = один вибраний товар + варіант)
   featured_products: {
      open: `{%- for block in section.blocks -%}{%- if block.type == 'featured_product_slide' -%}{%- assign product = block.settings.product -%}{%- if product != blank -%}{%- assign slide_variant = nil -%}{%- if block.settings.variant_title != blank -%}{%- assign slide_variant = product.variants | where: "title", block.settings.variant_title | first -%}{%- if slide_variant == nil -%}{%- assign _vtInput = block.settings.variant_title | downcase | strip | remove: " " -%}{%- for _v in product.variants -%}{%- assign _vtTitle = _v.title | downcase | strip | remove: " " -%}{%- if _vtTitle == _vtInput -%}{%- assign slide_variant = _v -%}{%- break -%}{%- endif -%}{%- endfor -%}{%- endif -%}{%- endif -%}{%- unless slide_variant -%}{%- assign slide_variant = product.selected_or_first_available_variant -%}{%- endunless -%}`,
      close: `{%- assign slide_variant = nil -%}{%- assign _vtInput = nil -%}{%- endif -%}{%- endif -%}{%- endfor -%}`,
   },
};

// ── transformSource ───────────────────────────────────────────────────────────
function transformSource(
   el: any,
   settings: any[],
): { blocks: any[]; presetBlocks: any[] } | null {
   const sourceEl = el.querySelector("[sf-source]");
   if (!sourceEl) return null;

   const source = sourceEl.getAttribute("sf-source")!;
   const fieldMap = SHOPIFY_FIELDS[source];
   const loop = SOURCE_LOOP[source];

   if (!fieldMap || !loop) {
      console.warn(`   ⚠️  sf-source="${source}" — невідоме джерело`);
      return null;
   }

   console.log(`   🔄  Source [sf-source="${source}"]`);

   settings.push({
      type: "header",
      content: `${formatLabel(source)} Settings`,
   });

   if (source === "products") {
      settings.push({
         type: "collection",
         id: "source_collection",
         label: "Collection",
      });
   }
   if (source === "blog") {
      settings.push({ type: "blog", id: "source_blog", label: "Blog" });
   }

   // collection_products та featured_products — без source_limit
   if (source !== "collection_products" && source !== "featured_products") {
      settings.push({
         type: "number",
         id: "source_limit",
         label: "Items to show",
         default: 6,
      });
   }

   const blockEl = sourceEl.querySelector("[sf-block]");
   if (!blockEl) {
      console.warn(
         `   ⚠️  sf-source="${source}" — не знайдено [sf-block] всередині`,
      );
      return null;
   }

   for (const node of blockEl.querySelectorAll("[sf-field]")) {
      const field = node.getAttribute("sf-field")!;
      const mapping = fieldMap[field];
      if (!mapping) continue;

      node.removeAttribute("sf-field");

      if (mapping.attr) {
         node.setAttribute(mapping.attr, mapping.liquid);
         if (mapping.attr === "src") {
            if (source === "products")
               node.setAttribute("alt", `{{ product.title }}`);
            if (source === "blog")
               node.setAttribute("alt", `{{ article.title }}`);
            if (source === "collections")
               node.setAttribute("alt", `{{ collection.title }}`);
         }
      } else {
         node.set_content(mapping.liquid);
      }
   }

   for (const node of blockEl.querySelectorAll("[sf-field]")) {
      const field = node.getAttribute("sf-field")!;
      const mapping = fieldMap[field];
      if (!mapping) continue;

      const cls = node.getAttribute("class") ?? "image-wrapper";
      const style = node.getAttribute("style") ?? "";
      const styleAttr = style ? ` style="${style}"` : "";

      let altLiquid = "";
      if (source === "products") altLiquid = `{{ product.title }}`;
      if (source === "blog") altLiquid = `{{ article.title }}`;
      if (source === "collections") altLiquid = `{{ collection.title }}`;

      node.removeAttribute("sf-field");
      node.replaceWith(
         `<div class="${cls}"${styleAttr}><img src="${mapping.liquid}" srcset="{{ product.featured_image | image_url: width: 400, format: 'webp' }} 400w, {{ product.featured_image | image_url: width: 800, format: 'webp' }} 800w" sizes="(max-width: 768px) 100vw, 800px" alt="${altLiquid}" class="img" loading="lazy"></div>`,
      );
   }

   blockEl.removeAttribute("sf-block");

   // collection_variants — додаємо data-* атрибути для JS-фільтра і ціни
   if (source === "collection_variants") {
      blockEl.setAttribute("data-product", "{{ product.handle }}");
      blockEl.setAttribute("data-type", "{{ product.type | handleize }}");
      blockEl.setAttribute("data-available", "{{ variant.available }}");
      blockEl.setAttribute("data-option1", "{{ variant.option1 | handleize }}");
      blockEl.setAttribute("data-option2", "{{ variant.option2 | handleize }}");
      blockEl.setAttribute("data-option3", "{{ variant.option3 | handleize }}");
      // ціна в центах — JS-фільтр використовує для price range
      blockEl.setAttribute("data-price", "{{ variant.price }}");
      // назва для JS sort by name
      blockEl.setAttribute("data-title", "{{ product.title | downcase }}");
      // alt для зображення варіанту
      const imgEl = blockEl.querySelector("img[sf-field='image'], img");
      if (imgEl) imgEl.setAttribute("alt", "{{ product.title }} — {{ variant.title }}");
      console.log(`   🎨  collection_variants — додано data-filter атрибути`);
   }

   // featured_products: обробляємо sf-id всередині блоку як section settings
   // (button text, badge text тощо — однакові для всіх слайдів)
   if (source === "featured_products") {
      for (const node of blockEl.querySelectorAll("[sf-id]")) {
         const id = node.getAttribute("sf-id")!;
         const type = (node.getAttribute("sf-type") ?? inferType(node.tagName)) as string;
         settings.push({ type, id, label: formatLabel(id), default: (node as any).innerText?.trim() ?? "" });
         (node as any).set_content(`{{ section.settings.${id} }}`);
         node.removeAttribute("sf-id");
         node.removeAttribute("sf-type");
      }
   }

   const blockHtml = blockEl.outerHTML;

   let loopOpen = loop.open;
   if (source === "products") {
      loopOpen = `{%- if section.settings.source_collection != blank -%}{%- assign source_collection = collections[section.settings.source_collection.handle] -%}{%- else -%}{%- assign source_collection = collection -%}{%- endif -%}${loop.open.replace("collection.products", "source_collection.products")}`;
   }
   if (source === "blog") {
      loopOpen = `{%- if section.settings.source_blog != blank -%}{%- assign source_blog = blogs[section.settings.source_blog.handle] -%}{%- else -%}{%- assign source_blog = blog -%}{%- endif -%}${loop.open.replace("blog.articles", "source_blog.articles")}`;
   }

   const liquidContent = `${loopOpen}${blockHtml}${loop.close}`;

   const allBlocks = sourceEl.querySelectorAll("[sf-block]");
   for (const b of allBlocks) b.remove();

   sourceEl.removeAttribute("sf-source");
   sourceEl.set_content(liquidContent);

   // featured_products — секційні налаштування картки слайду
   if (source === "featured_products") {
      settings.push({ type: "header", content: "Card Settings" });
      settings.push({ type: "checkbox", id: "slide_show_desc", label: "Show short description", default: false });
      settings.push({ type: "number", id: "slide_desc_length", label: "Description length (chars)", default: 100 });

      settings.push({ type: "header", content: "Card Image Ratio" });
      settings.push({ type: "paragraph", content: "Enter any CSS aspect-ratio value: 1/1, 4/3, 3/4, 16/9, 320/240, etc." });
      [
         { id: "slide_img_ratio_desktop", label: "Desktop", default: "4/3" },
         { id: "slide_img_ratio_tablet",  label: "Tablet",  default: "4/3" },
         { id: "slide_img_ratio_mobile",  label: "Mobile",  default: "1/1" },
      ].forEach(({ id, label, default: def }) => {
         settings.push({ type: "text", id, label, default: def });
      });

      settings.push({ type: "header", content: "Sale Badge" });
      settings.push({ type: "checkbox", id: "slide_show_badge", label: "Show sale badge", default: true });
      settings.push({
         type: "select", id: "slide_badge_type", label: "Badge type",
         options: [
            { value: "percent", label: "Auto percent (e.g. -20%)" },
            { value: "text", label: "Text (e.g. SALE)" },
         ],
         default: "percent",
      });
      settings.push({ type: "text", id: "slide_badge_text", label: "Badge text (if type = Text)", default: "SALE" });
      settings.push({
         type: "select", id: "slide_badge_position", label: "Badge position",
         options: [
            { value: "image", label: "On image" },
            { value: "price", label: "Near price" },
         ],
         default: "image",
      });

      settings.push({ type: "header", content: "Tag Labels" });
      settings.push({ type: "checkbox", id: "slide_show_tags", label: "Show tag labels", default: true });
      settings.push({
         type: "select", id: "slide_tag_badge_position", label: "Badge position",
         options: [
            { value: "info", label: "Near description" },
            { value: "image", label: "On image" },
            { value: "none", label: "Hidden" },
         ],
         default: "info",
      });
      settings.push({
         type: "text", id: "slide_tag_labels", label: "Tags to show (comma-separated)",
         default: "new,sale,hot,bestseller",
         info: "Add matching tags to products in Shopify admin. Also supports variant metafield custom.badge.",
      });

      settings.push({ type: "header", content: "Card Element Order" });
      settings.push({ type: "paragraph", content: "Set 1–4 for element order inside the card info block." });
      [
         { id: "slide_order_title", label: "Title order",       default: "1" },
         { id: "slide_order_desc",  label: "Description order", default: "2" },
         { id: "slide_order_price", label: "Price order",       default: "3" },
         { id: "slide_order_btn",   label: "Button order",      default: "4" },
      ].forEach(({ id, label, default: def }) => {
         settings.push({
            type: "select", id, label,
            options: [
               { value: "1", label: "1 — First" },
               { value: "2", label: "2 — Second" },
               { value: "3", label: "3 — Third" },
               { value: "4", label: "4 — Fourth" },
            ],
            default: def,
         });
      });
   }

   // featured_products — повертаємо block schema (product picker per slide)
   if (source === "featured_products") {
      const featuredBlock = {
         type: "featured_product_slide",
         name: "Product Slide",
         settings: [
            { type: "product", id: "product", label: "Product" },
            {
               type: "text",
               id: "variant_title",
               label: "Variant title",
               info: "Click a variant button in the preview — it auto-fills this field. Leave blank for first available variant.",
            },
         ],
      };
      // 3 дефолтні порожні блоки
      const presetBlocks = [
         { type: "featured_product_slide", settings: {} },
         { type: "featured_product_slide", settings: {} },
         { type: "featured_product_slide", settings: {} },
      ];
      return { blocks: [featuredBlock], presetBlocks };
   }

   return { blocks: [], presetBlocks: [] };
}

// ── getSliderSettings ─────────────────────────────────────────────────────────
// Генерує settings і data-* атрибути для конкретного параметра слайдера.
// prefix = blockType (наприклад "product_slide", "review_slide") —
// гарантує унікальність id коли в секції кілька слайдерів.
function getSliderSettings(
   param: string,
   prefix: string,
): { settings: any[]; dataAttrs: string[] } | null {
   switch (param) {
      case "autoplay":
         return {
            settings: [
               { type: "header", content: "Autoplay" },
               {
                  type: "checkbox",
                  id: `${prefix}_autoplay_enabled`,
                  label: "Enable Autoplay",
                  default: false,
               },
               {
                  type: "number",
                  id: `${prefix}_autoplay_delay`,
                  label: "Delay (ms)",
                  default: 3000,
               },
            ],
            dataAttrs: [
               `{% if section.settings.${prefix}_autoplay_enabled %}data-autoplay="{{ section.settings.${prefix}_autoplay_delay }}"{% endif %}`,
            ],
         };

      case "speed":
         return {
            settings: [
               {
                  type: "number",
                  id: `${prefix}_speed`,
                  label: "Slide Speed (ms)",
                  default: 500,
               },
            ],
            dataAttrs: [`data-speed="{{ section.settings.${prefix}_speed }}"`],
         };

      case "loop":
         return {
            settings: [
               {
                  type: "checkbox",
                  id: `${prefix}_loop`,
                  label: "Loop",
                  default: true,
               },
            ],
            dataAttrs: [`data-loop="{{ section.settings.${prefix}_loop }}"`],
         };

      case "effect":
         return {
            settings: [
               {
                  type: "select",
                  id: `${prefix}_effect`,
                  label: "Effect",
                  options: [
                     { value: "slide", label: "Slide" },
                     { value: "fade", label: "Fade" },
                     { value: "cards", label: "Cards" },
                     { value: "creative", label: "Creative" },
                     { value: "coverflow", label: "Coverflow" },
                  ],
                  default: "slide",
               },
               {
                  type: "header",
                  content: "Coverflow Settings",
               },
               {
                  type: "number",
                  id: `${prefix}_coverflow_depth`,
                  label: "Depth",
                  default: 100,
                  info: "Slide depth offset in px",
               },
               {
                  type: "text",
                  id: `${prefix}_coverflow_scale`,
                  label: "Scale (e.g. 0.85)",
                  default: "0.85",
                  info: "Scale of inactive slides (0.0–1.0)",
               },
               {
                  type: "number",
                  id: `${prefix}_coverflow_rotate`,
                  label: "Rotate",
                  default: 0,
                  info: "Slide rotate in degrees",
               },
               {
                  type: "checkbox",
                  id: `${prefix}_coverflow_shadows`,
                  label: "Slide shadows",
                  default: false,
               },
            ],
            dataAttrs: [
               `data-effect="{{ section.settings.${prefix}_effect }}"`,
               `data-coverflow-depth="{{ section.settings.${prefix}_coverflow_depth }}"`,
               `data-coverflow-scale="{{ section.settings.${prefix}_coverflow_scale }}"`,
               `data-coverflow-rotate="{{ section.settings.${prefix}_coverflow_rotate }}"`,
               `data-coverflow-shadows="{{ section.settings.${prefix}_coverflow_shadows }}"`,
            ],
         };

      case "slides_per_view":
         return {
            settings: [
               { type: "header", content: "Slides per view" },
               {
                  type: "text",
                  id: `${prefix}_slides_mobile`,
                  label: "Mobile 0–767 (e.g. 1, 1.2)",
                  default: "1",
                  info: "Use decimal for peek effect (e.g. 1.2)",
               },
               {
                  type: "text",
                  id: `${prefix}_slides_tablet_sm`,
                  label: "Tablet SM 768–959 (e.g. 2, 2.5)",
                  default: "1",
               },
               {
                  type: "text",
                  id: `${prefix}_slides_tablet`,
                  label: "Tablet 960–1199 (e.g. 2, 2.5)",
                  default: "2",
               },
               {
                  type: "text",
                  id: `${prefix}_slides_desktop`,
                  label: "Desktop 1200+ (e.g. 3, 3.5)",
                  default: "3",
               },
            ],
            dataAttrs: [
               `data-slides-mobile="{{ section.settings.${prefix}_slides_mobile }}"`,
               `data-slides-tablet-sm="{{ section.settings.${prefix}_slides_tablet_sm }}"`,
               `data-slides-tablet="{{ section.settings.${prefix}_slides_tablet }}"`,
               `data-slides-desktop="{{ section.settings.${prefix}_slides_desktop }}"`,
            ],
         };

      case "space_between":
         return {
            settings: [
               { type: "header", content: "Space between slides" },
               {
                  type: "text",
                  id: `${prefix}_space_mobile`,
                  label: "Mobile 0–767 (e.g. 16, -20)",
                  default: "16",
                  info: "Negative value = slides overlap",
               },
               {
                  type: "text",
                  id: `${prefix}_space_tablet_sm`,
                  label: "Tablet SM 768–959 (e.g. 20)",
                  default: "20",
               },
               {
                  type: "text",
                  id: `${prefix}_space_tablet`,
                  label: "Tablet 960–1199 (e.g. 24, -40)",
                  default: "24",
               },
               {
                  type: "text",
                  id: `${prefix}_space_desktop`,
                  label: "Desktop 1200+ (e.g. 30, -60)",
                  default: "30",
               },
            ],
            dataAttrs: [
               `data-space-mobile="{{ section.settings.${prefix}_space_mobile }}"`,
               `data-space-tablet-sm="{{ section.settings.${prefix}_space_tablet_sm }}"`,
               `data-space-tablet="{{ section.settings.${prefix}_space_tablet }}"`,
               `data-space-desktop="{{ section.settings.${prefix}_space_desktop }}"`,
            ],
         };

      case "arrows":
         return {
            settings: [
               { type: "header", content: "Show Arrows" },
               {
                  type: "checkbox",
                  id: `${prefix}_arrows_mobile`,
                  label: "Mobile",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_arrows_tablet_sm`,
                  label: "Tablet SM 768–959",
                  default: true,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_arrows_tablet`,
                  label: "Tablet 960–1199",
                  default: true,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_arrows_desktop`,
                  label: "Desktop 1200+",
                  default: true,
               },
            ],
            dataAttrs: [
               `data-arrows-mobile="{{ section.settings.${prefix}_arrows_mobile }}"`,
               `data-arrows-tablet-sm="{{ section.settings.${prefix}_arrows_tablet_sm }}"`,
               `data-arrows-tablet="{{ section.settings.${prefix}_arrows_tablet }}"`,
               `data-arrows-desktop="{{ section.settings.${prefix}_arrows_desktop }}"`,
            ],
         };

      case "centered":
         return {
            settings: [
               { type: "header", content: "Centered Slides" },
               {
                  type: "checkbox",
                  id: `${prefix}_centered_mobile`,
                  label: "Mobile",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_centered_tablet_sm`,
                  label: "Tablet SM 768–959",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_centered_tablet`,
                  label: "Tablet 960–1199",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_centered_desktop`,
                  label: "Desktop 1200+",
                  default: false,
               },
            ],
            dataAttrs: [
               `data-centered-mobile="{{ section.settings.${prefix}_centered_mobile }}"`,
               `data-centered-tablet-sm="{{ section.settings.${prefix}_centered_tablet_sm }}"`,
               `data-centered-tablet="{{ section.settings.${prefix}_centered_tablet }}"`,
               `data-centered-desktop="{{ section.settings.${prefix}_centered_desktop }}"`,
            ],
         };

      case "scale":
         return {
            settings: [
               { type: "header", content: "Scale inactive slides" },
               {
                  type: "checkbox",
                  id: `${prefix}_scale_mobile`,
                  label: "Mobile",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_scale_tablet_sm`,
                  label: "Tablet SM 768–959",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_scale_tablet`,
                  label: "Tablet 960–1199",
                  default: false,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_scale_desktop`,
                  label: "Desktop 1200+",
                  default: false,
               },
               {
                  type: "text",
                  id: `${prefix}_scale`,
                  label: "Scale factor (e.g. 0.85)",
                  default: "0.85",
                  info: "Value between 0.5 and 1.0",
               },
            ],
            dataAttrs: [
               `data-scale-mobile="{{ section.settings.${prefix}_scale_mobile }}"`,
               `data-scale-tablet-sm="{{ section.settings.${prefix}_scale_tablet_sm }}"`,
               `data-scale-tablet="{{ section.settings.${prefix}_scale_tablet }}"`,
               `data-scale-desktop="{{ section.settings.${prefix}_scale_desktop }}"`,
               `data-scale="{{ section.settings.${prefix}_scale }}"`,
            ],
         };

      case "pagination":
         return {
            settings: [
               { type: "header", content: "Pagination" },
               {
                  type: "checkbox",
                  id: `${prefix}_pagination_mobile`,
                  label: "Mobile",
                  default: true,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_pagination_tablet_sm`,
                  label: "Tablet SM 768–959",
                  default: true,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_pagination_tablet`,
                  label: "Tablet 960–1199",
                  default: true,
               },
               {
                  type: "checkbox",
                  id: `${prefix}_pagination_desktop`,
                  label: "Desktop 1200+",
                  default: false,
               },
               {
                  type: "select",
                  id: `${prefix}_pagination_type`,
                  label: "Pagination Type",
                  options: [
                     { value: "bullets", label: "Bullets" },
                     { value: "fraction", label: "Fraction" },
                     { value: "progressbar", label: "Progress Bar" },
                  ],
                  default: "bullets",
               },
            ],
            dataAttrs: [
               `data-pagination-mobile="{{ section.settings.${prefix}_pagination_mobile }}"`,
               `data-pagination-tablet-sm="{{ section.settings.${prefix}_pagination_tablet_sm }}"`,
               `data-pagination-tablet="{{ section.settings.${prefix}_pagination_tablet }}"`,
               `data-pagination-desktop="{{ section.settings.${prefix}_pagination_desktop }}"`,
               `data-pagination-type="{{ section.settings.${prefix}_pagination_type }}"`,
            ],
         };

      default:
         return null;
   }
}

// ── transformPagination ───────────────────────────────────────────────────────
// sf-pagination="per_page,animation" на [data-pagination-root] —
// генерує Shopify section settings і прописує {{ section.settings.xxx }}
// у відповідні data-* атрибути пагінації.
//
// Параметри:
//   per_page  — кількість товарів на сторінці (range 4–48)
//   animation — анімація зміни сторінки (select: fade/slide/scale/blur/none)
//
function transformPagination(el: any, settings: any[]): void {
   const paginationEl = el.querySelector(
      "[data-pagination-root][sf-pagination]",
   );
   if (!paginationEl) return;

   const sfPagination = paginationEl.getAttribute("sf-pagination") ?? "";
   paginationEl.removeAttribute("sf-pagination");

   const params = sfPagination
      .split(",")
      .map((p: string) => p.trim())
      .filter(Boolean);
   if (!params.length) return;

   console.log(`   📄  Pagination params: ${params.join(", ")}`);
   settings.push({ type: "header", content: "Pagination Settings" });

   for (const param of params) {
      switch (param) {
         case "per_page":
            settings.push({ type: "number", id: "pg_per_page", label: "Products per page (desktop)", default: 12 });
            paginationEl.setAttribute("data-per-page", "{{ section.settings.pg_per_page }}");
            paginationEl.setAttribute("data-per-page-desktop", "{{ section.settings.pg_per_page }}");
            break;

         case "per_page_tablet":
            settings.push({ type: "number", id: "pg_per_page_tablet", label: "Products per page (tablet)", default: 9, info: "960–1199px" });
            paginationEl.setAttribute("data-per-page-tablet", "{{ section.settings.pg_per_page_tablet }}");
            break;

         case "per_page_mobile":
            settings.push({ type: "number", id: "pg_per_page_mobile", label: "Products per page (mobile)", default: 6, info: "≤960px" });
            paginationEl.setAttribute("data-per-page-mobile", "{{ section.settings.pg_per_page_mobile }}");
            break;

         case "animation":
            settings.push({
               type: "select", id: "pg_animation", label: "Page switch animation",
               options: [
                  { value: "fade", label: "Fade" }, { value: "slide", label: "Slide" },
                  { value: "scale", label: "Scale" }, { value: "blur", label: "Blur" },
                  { value: "none", label: "None" },
               ],
               default: "fade",
            });
            paginationEl.setAttribute("data-animation", "{{ section.settings.pg_animation }}");
            break;

         case "show_info":
            settings.push({ type: "checkbox", id: "pg_show_info", label: "Show page counter (X / Y)", default: true });
            paginationEl.setAttribute("data-show-info", "{{ section.settings.pg_show_info }}");
            break;

         case "show_arrows":
            settings.push({ type: "checkbox", id: "pg_show_arrows", label: "Show prev / next arrows", default: true });
            paginationEl.setAttribute("data-show-arrows", "{{ section.settings.pg_show_arrows }}");
            break;

         case "show_first_last":
            settings.push({ type: "checkbox", id: "pg_show_first_last", label: "Show first / last buttons", default: false });
            paginationEl.setAttribute("data-show-first-last", "{{ section.settings.pg_show_first_last }}");
            break;

         case "show_progress":
            settings.push({ type: "checkbox", id: "pg_show_progress", label: "Show progress bar", default: false });
            paginationEl.setAttribute("data-show-progress", "{{ section.settings.pg_show_progress }}");
            break;

         case "siblings":
            settings.push({ type: "number", id: "pg_siblings", label: "Visible page buttons (each side)", default: 1 });
            paginationEl.setAttribute("data-siblings", "{{ section.settings.pg_siblings }}");
            break;

         case "scroll_to":
            settings.push({ type: "checkbox", id: "pg_scroll_to", label: "Scroll to top on page change", default: true });
            paginationEl.setAttribute("data-scroll-to", "{{ section.settings.pg_scroll_to }}");
            break;

         case "scroll_offset":
            settings.push({ type: "number", id: "pg_scroll_offset", label: "Scroll offset (px)", default: 80 });
            paginationEl.setAttribute("data-scroll-offset", "{{ section.settings.pg_scroll_offset }}");
            break;

         case "labels":
            settings.push({ type: "header", content: "Pagination Labels" });
            settings.push({ type: "text", id: "pg_label_prev",  label: "Previous button",   default: "Previous" });
            settings.push({ type: "text", id: "pg_label_next",  label: "Next button",       default: "Next" });
            settings.push({ type: "text", id: "pg_label_info",  label: "Page info template", default: "{current} / {pages}", info: "Use {current} and {pages}" });
            paginationEl.setAttribute("data-label-prev", "{{ section.settings.pg_label_prev | default: 'Previous' }}");
            paginationEl.setAttribute("data-label-next", "{{ section.settings.pg_label_next | default: 'Next' }}");
            paginationEl.setAttribute("data-label-info", "{{ section.settings.pg_label_info }}");
            break;

         default:
            console.warn(`   ⚠️  sf-pagination: невідомий параметр "${param}"`);
      }
   }
}

// ── transformCollectionFilter ─────────────────────────────────────────────────
// Обробляє [data-filter-root] і [data-collection-page] в секції колекції:
//  - додає Shopify settings: filter_position (top/sidebar)
//  - прописує data-filter-position="{{ section.settings.filter_position }}" на root
//  - додає data-label-product/option1/option2/option3 з product.options Liquid
//    щоб JS-фільтр міг підписати групи ("Color", "Storage", "Model" тощо)
//
function transformCollectionFilter(el: any, settings: any[]): void {
   const filterRoot = el.querySelector("[data-filter-root]");
   if (!filterRoot) return;

   // ❗ el сам може мати data-collection-page — querySelector шукає тільки нащадків,
   //    тому перевіряємо і сам el, і його нащадків
   const collectionEl =
      el.getAttribute("data-collection-page") !== null
         ? el
         : el.querySelector("[data-collection-page]");
   if (!collectionEl) return;

   console.log(`   🔽  CollectionFilter → додаємо settings і label-атрибути`);

   // ── Filter position setting ───────────────────────────────────────────────
   settings.push({ type: "header", content: "Filter Settings" });
   const positionOptions = [
      { value: "top",   label: "Top (horizontal)" },
      { value: "left",  label: "Sidebar left" },
      { value: "right", label: "Sidebar right" },
   ];
   settings.push({ type: "select", id: "filter_position",        label: "Filter position (desktop ≥1200px)", options: positionOptions, default: "top" });
   settings.push({ type: "select", id: "filter_position_tablet", label: "Filter position (tablet 960–1199px)", options: positionOptions, default: "top" });
   settings.push({ type: "select", id: "filter_position_mobile", label: "Filter position (mobile ≤960px)", options: positionOptions, default: "top" });
   settings.push({
      type: "checkbox",
      id: "filter_accordion",
      label: "Collapse groups on desktop (accordion)",
      default: false,
   });
   settings.push({
      type: "checkbox",
      id: "filter_nested",
      label: "Nested: show models inside category accordion",
      default: false,
      info: "Models appear inside each category when expanded. Requires 'Product type' set on products.",
   });

   // ── Filter label settings (i18n — текст виводиться в адмін, не захардкоджений в JS) ──
   settings.push({ type: "header", content: "Filter Labels" });
   settings.push({
      type: "text",
      id: "filter_label_filter",
      label: "Filter heading",
      default: "Filters",
      info: "Shown above filter groups. Leave blank to hide.",
   });
   settings.push({
      type: "text",
      id: "filter_label_type",
      label: "Category group label",
      default: "Category",
      info: "Uses product 'Product type' field in Shopify admin.",
   });
   settings.push({
      type: "text",
      id: "filter_label_price",
      label: "Price group label",
      default: "Price",
   });
   settings.push({
      type: "text",
      id: "filter_label_reset",
      label: "Reset button text",
      default: "Clear filters",
   });

   // ── Прописуємо data-атрибути на section ──────────────────────────────────
   // JS читає та динамічно оновлює data-filter-position залежно від breakpoint
   collectionEl.setAttribute("data-filter-position",        "{{ section.settings.filter_position | default: 'top' }}");
   collectionEl.setAttribute("data-filter-position-desktop","{{ section.settings.filter_position | default: 'top' }}");
   collectionEl.setAttribute("data-filter-position-tablet", "{{ section.settings.filter_position_tablet | default: 'top' }}");
   collectionEl.setAttribute("data-filter-position-mobile", "{{ section.settings.filter_position_mobile | default: 'top' }}");
   // JS читає для accordion поведінки
   collectionEl.setAttribute(
      "data-filter-accordion",
      "{{ section.settings.filter_accordion }}",
   );
   collectionEl.setAttribute(
      "data-filter-nested",
      "{{ section.settings.filter_nested }}",
   );

   // ── Option name labels для JS-фільтра ─────────────────────────────────────
   // Шукаємо перший продукт з більш ніж 1 опцією (щоб не брати "Title" від single-variant)
   collectionEl.setAttribute("data-label-type", "{{ section.settings.filter_label_type | default: 'Category' }}");
   collectionEl.setAttribute("data-label-product", "Model");
   collectionEl.setAttribute(
      "data-label-option1",
      "{%- assign _lp = nil -%}{%- for _p in collection.products -%}{%- if _p.options.size > 1 -%}{%- assign _lp = _p -%}{%- break -%}{%- endif -%}{%- endfor -%}{{ _lp.options[0] | default: collection.products.first.options[0] | default: 'Color' }}",
   );
   collectionEl.setAttribute(
      "data-label-option2",
      "{{ _lp.options[1] | default: collection.products.first.options[1] | default: 'Option 2' }}",
   );
   // Для option3 потрібен продукт з options.size > 2 (окремий пошук)
   collectionEl.setAttribute(
      "data-label-option3",
      "{%- assign _lp3 = nil -%}{%- for _p3 in collection.products -%}{%- if _p3.options.size > 2 -%}{%- assign _lp3 = _p3 -%}{%- break -%}{%- endif -%}{%- endfor -%}{{ _lp3.options[2] | default: collection.products.first.options[2] | default: '' }}",
   );

   // ── Текстові лейбли для фільтра (i18n через Shopify settings) ────────────
   filterRoot.setAttribute(
      "data-label-filter",
      "{{ section.settings.filter_label_filter | default: 'Filters' }}",
   );
   filterRoot.setAttribute(
      "data-label-price",
      "{{ section.settings.filter_label_price | default: 'Price' }}",
   );
   filterRoot.setAttribute(
      "data-label-reset",
      "{{ section.settings.filter_label_reset | default: 'Clear filters' }}",
   );

   // ── Card Settings ─────────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Card Settings" });
   settings.push({
      type: "checkbox",
      id: "show_card_desc",
      label: "Show short description",
      default: false,
   });
   settings.push({ type: "number", id: "card_desc_length", label: "Description length (chars)", default: 100 });

   // ── Card Sale Badge ───────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Sale Badge" });
   settings.push({ type: "checkbox", id: "card_sale_badge", label: "Show sale badge", default: true });
   settings.push({
      type: "select", id: "card_badge_type", label: "Badge type",
      options: [
         { value: "percent", label: "Auto percent (e.g. -20%)" },
         { value: "text", label: "Text (e.g. SALE)" },
      ],
      default: "percent",
   });
   settings.push({ type: "text", id: "card_sale_badge_text", label: "Badge text (if type = Text)", default: "SALE" });
   settings.push({
      type: "select", id: "card_sale_badge_position", label: "Badge position",
      options: [
         { value: "image", label: "On image" },
         { value: "price", label: "Near price" },
      ],
      default: "image",
   });

   // ── Tag Labels ────────────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Tag Labels" });
   settings.push({ type: "checkbox", id: "card_show_tags", label: "Show tag labels", default: true });
   settings.push({
      type: "select", id: "card_badge_position", label: "Badge position",
      options: [
         { value: "info", label: "Near description" },
         { value: "image", label: "On image" },
         { value: "none", label: "Hidden" },
      ],
      default: "info",
   });
   settings.push({
      type: "text", id: "card_tag_labels", label: "Tags to show (comma-separated)",
      default: "new,sale,hot,bestseller",
      info: "Add matching tags to products in Shopify admin. Also supports variant metafield custom.badge. Recognized colors: new (green), sale (red), hot (orange), bestseller (gold).",
   });

   // ── Sort ──────────────────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Sort & View" });
   settings.push({ type: "checkbox", id: "show_sort", label: "Show sort options", default: true });
   settings.push({ type: "checkbox", id: "show_view_toggle", label: "Show grid/list toggle", default: true });

   // ── Filter UX ─────────────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Filter UX" });
   settings.push({ type: "checkbox", id: "filter_show_chips", label: "Show active filter chips", default: true });
   settings.push({ type: "text", id: "filter_label_empty", label: "Empty state message", default: "No products found" });

   // ── Card Element Order ────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Card Element Order" });
   settings.push({ type: "paragraph", content: "Set 1–2 for image/info block position. Set 1–4 for elements inside the info block." });
   // Image and info: only 2 options — use select (Shopify range requires ≥3 steps)
   settings.push({
      type: "select", id: "card_order_image", label: "Image position",
      options: [{ value: "1", label: "1 — First" }, { value: "2", label: "2 — Second" }],
      default: "1",
   });
   settings.push({
      type: "select", id: "card_order_info", label: "Info block position",
      options: [{ value: "1", label: "1 — First" }, { value: "2", label: "2 — Second" }],
      default: "2",
   });
   // Title, desc, price, btn: select 1–4
   [
      { id: "card_order_title",   label: "Title",       default: "1" },
      { id: "card_order_desc",    label: "Description", default: "2" },
      { id: "card_order_price",   label: "Price",       default: "3" },
      { id: "card_order_btn",     label: "Button",      default: "4" },
   ].forEach(({ id, label, default: def }) => {
      settings.push({
         type: "select", id, label,
         options: [
            { value: "1", label: "1 — First" },
            { value: "2", label: "2 — Second" },
            { value: "3", label: "3 — Third" },
            { value: "4", label: "4 — Fourth" },
         ],
         default: def,
      });
   });

   // ── Card Image Ratio ──────────────────────────────────────────────────────
   settings.push({ type: "header", content: "Card Image Ratio" });
   settings.push({ type: "paragraph", content: "Enter any CSS aspect-ratio value: 1/1, 4/3, 3/4, 16/9, 320/240, etc." });
   [
      { id: "card_img_ratio_desktop", label: "Desktop", default: "1/1" },
      { id: "card_img_ratio_tablet",  label: "Tablet",  default: "1/1" },
      { id: "card_img_ratio_mobile",  label: "Mobile",  default: "1/1" },
   ].forEach(({ id, label, default: def }) => {
      settings.push({ type: "text", id, label, default: def });
   });

   // ── Price Filter Input Type ───────────────────────────────────────────────
   settings.push({ type: "header", content: "Price Filter" });
   settings.push({
      type: "select",
      id: "price_filter_type",
      label: "Price input type",
      options: [
         { value: "range",  label: "Range slider only" },
         { value: "inputs", label: "Text inputs only" },
         { value: "both",   label: "Slider + text inputs" },
      ],
      default: "range",
   });
   settings.push({
      type: "text",
      id: "filter_label_price_from",
      label: "From placeholder",
      default: "From",
   });
   settings.push({
      type: "text",
      id: "filter_label_price_to",
      label: "To placeholder",
      default: "To",
   });

   // ── Data attributes на section ────────────────────────────────────────────
   collectionEl.setAttribute(
      "data-show-card-desc",
      "{{ section.settings.show_card_desc }}",
   );
   collectionEl.setAttribute(
      "data-show-sort",
      "{{ section.settings.show_sort }}",
   );
   collectionEl.setAttribute(
      "data-show-view-toggle",
      "{{ section.settings.show_view_toggle }}",
   );
   filterRoot.setAttribute(
      "data-tag-labels",
      "{{ section.settings.card_tag_labels | default: 'new,sale,hot,bestseller' }}",
   );

   // CSS variables для order елементів картки (через inline style)
   collectionEl.setAttribute(
      "style",
      [
         "--card-img-order:{{ section.settings.card_order_image }}",
         "--card-info-order:{{ section.settings.card_order_info }}",
         "--card-title-order:{{ section.settings.card_order_title }}",
         "--card-desc-order:{{ section.settings.card_order_desc }}",
         "--card-price-order:{{ section.settings.card_order_price }}",
         "--card-btn-order:{{ section.settings.card_order_btn }}",
         "--card-img-ratio-desktop:{{ section.settings.card_img_ratio_desktop | default: '1/1' }}",
         "--card-img-ratio-tablet:{{ section.settings.card_img_ratio_tablet | default: '1/1' }}",
         "--card-img-ratio-mobile:{{ section.settings.card_img_ratio_mobile | default: '1/1' }}",
      ].join(";"),
   );

   // Price filter settings для JS
   filterRoot.setAttribute(
      "data-price-filter-type",
      "{{ section.settings.price_filter_type | default: 'range' }}",
   );
   filterRoot.setAttribute(
      "data-label-price-from",
      "{{ section.settings.filter_label_price_from | default: 'From' }}",
   );
   filterRoot.setAttribute(
      "data-label-price-to",
      "{{ section.settings.filter_label_price_to | default: 'To' }}",
   );
   filterRoot.setAttribute(
      "data-show-chips",
      "{{ section.settings.filter_show_chips }}",
   );
   filterRoot.setAttribute(
      "data-label-empty",
      "{{ section.settings.filter_label_empty | default: 'No products found' }}",
   );
}

// ── transformSlider ───────────────────────────────────────────────────────────
// sf-slider="autoplay,speed,..."  — які параметри виводити в адмінку
// sf-slider-block="product_slide" — унікальна назва типу блоку для цього слайдера
//
// Приклад використання в .astro:
//   <div sf-slider="slides_per_view,space_between" sf-slider-block="product_slide" class="slider">
//     <div class="swiper">
//       <div class="swiper-wrapper">
//         <div sf-block class="swiper-slide">...</div>
//       </div>
//     </div>
//   </div>
function transformSlider(
   el: any,
   settings: any[],
): { blocks: any[]; presetBlocks: any[] } | null {
   const sliderEl = el.querySelector("[sf-slider]");
   if (!sliderEl) return null;

   const sfSlider = sliderEl.getAttribute("sf-slider") ?? "";

   // Читаємо назву блоку — обов'язково вказувати якщо слайдерів кілька в секції
   const rawBlockType =
      sliderEl.getAttribute("sf-slider-block") ?? "slider_slide";
   const blockType = rawBlockType.replace(/-/g, "_");
   const blockName = formatLabel(blockType);

   // Прибираємо sf-* атрибути щоб не потрапили в liquid
   sliderEl.removeAttribute("sf-slider");
   sliderEl.removeAttribute("sf-slider-block");

   if (!sfSlider) return null;

   const params = sfSlider
      .split(",")
      .map((p: string) => p.trim())
      .filter(Boolean);

   console.log(
      `   🎠  Slider block="${blockType}" params: ${params.join(", ")}`,
   );

   settings.push({ type: "header", content: `${blockName} Slider Settings` });

   const dataAttrs: string[] = [];

   for (const param of params) {
      const mapping = getSliderSettings(param, blockType);
      if (!mapping) {
         console.warn(`   ⚠️  sf-slider: невідомий параметр "${param}"`);
         continue;
      }
      settings.push(...mapping.settings);
      dataAttrs.push(...mapping.dataAttrs);
   }

   // Додаємо data-* атрибути на елемент слайдера
   for (const attr of dataAttrs) {
      if (attr.startsWith("{%")) {
         // Liquid умовний атрибут — placeholder, замінюється в post-process
         sliderEl.setAttribute(
            `__liquid_attr_${dataAttrs.indexOf(attr)}__`,
            attr,
         );
      } else {
         const eqIdx = attr.indexOf("=");
         const attrName = attr.slice(0, eqIdx).trim();
         const attrVal = attr.slice(eqIdx + 1).replace(/^"|"$/g, "");
         sliderEl.setAttribute(attrName, attrVal);
      }
   }

   // ── Трансформуємо sf-block всередині ────────────────────────────────────
   // Шукаємо .swiper-wrapper як контейнер слайдів, fallback → сам sliderEl
   const wrapperEl = sliderEl.querySelector(".swiper-wrapper") ?? sliderEl;

   // Якщо всередині є sf-source — не чіпаємо, transformSource обробить сам
   const hasSource =
      !!wrapperEl.querySelector("[sf-source]") ||
      wrapperEl.getAttribute("sf-source");
   if (hasSource) {
      console.log(
         `   🔗  Slider з sf-source — блоки генеруються через Liquid loop`,
      );
      return null;
   }

   const blocksResult = transformBlocks(wrapperEl, blockType, blockName);

   if (blocksResult) {
      return {
         blocks: blocksResult.blocks,
         presetBlocks: blocksResult.presetBlocks,
      };
   }

   return null;
}

// ── transformGallery ─────────────────────────────────────────────────────────
function transformGallery(
   el: any,
): { blocks: any[]; presetBlocks: any[] } | null {
   const galleryEl = el.querySelector("[sf-gallery]");
   if (!galleryEl) return null;

   const items = galleryEl.querySelectorAll("a[data-fancybox]");
   if (!items.length) return null;

   console.log(`   🖼️  Галерея [sf-gallery]: ${items.length} елементів`);

   const firstItem = items[0];
   const hasOverlay = !!firstItem.querySelector(".gallery__overlay");
   const hasTitle = !!firstItem.querySelector(".gallery__title");
   const hasDesc = !!firstItem.querySelector(".gallery__desc");
   const hasIcon = !!firstItem.querySelector(".gallery__icon");
   const iconInnerHtml =
      firstItem.querySelector(".gallery__icon")?.innerHTML ?? "";

   const overlayHtml = hasOverlay ? `<div class="gallery__overlay"></div>` : "";
   const infoHtml =
      hasTitle || hasDesc
         ? `<div class="gallery__info">${hasTitle ? `<h3 class="gallery__title">{{ block.settings.title }}</h3>` : ""}${hasDesc ? `<p class="gallery__desc">{{ block.settings.short_desc }}</p>` : ""}</div>`
         : "";
   const iconHtml = hasIcon
      ? `<div class="gallery__icon">${iconInnerHtml}</div>`
      : "";

   const presetBlocks = Array.from(items).map((item: any) => {
      const fullFile =
         (item.getAttribute("href") ?? "").split("/").pop()?.split("?")[0] ??
         "";
      const thumbFile =
         (item.querySelector("img")?.getAttribute("src") ?? "")
            .split("/")
            .pop()
            ?.split("?")[0] ?? "";
      const caption = item.getAttribute("data-caption") ?? "";
      const title =
         item.querySelector(".gallery__title")?.innerText?.trim() ??
         item.getAttribute("aria-label") ??
         "";
      const shortDesc =
         item.querySelector(".gallery__desc")?.innerText?.trim() ?? "";
      return {
         type: "gallery_image",
         settings: {
            title,
            short_desc: shortDesc,
            full_caption: caption,
            default_thumb: thumbFile,
            default_full: fullFile,
         },
      };
   });

   const liquidContent = `{%- for block in section.blocks -%}{%- if block.type == 'gallery_image' -%}<a data-fancybox="gallery" data-caption="{{ block.settings.full_caption }}" class="gallery__img" href="{% if block.settings.full %}{{ block.settings.full | image_url: width: 1600, format: 'webp' }}{% else %}{{ block.settings.default_full | asset_url }}{% endif %}" aria-label="{{ block.settings.title }}" {{ block.shopify_attributes }}><img src="{% if block.settings.thumb %}{{ block.settings.thumb | image_url: width: 800, format: 'webp' }}{% else %}{{ block.settings.default_thumb | asset_url }}{% endif %}" srcset="{% if block.settings.thumb %}{{ block.settings.thumb | image_url: width: 400, format: 'webp' }} 400w, {{ block.settings.thumb | image_url: width: 800, format: 'webp' }} 800w, {{ block.settings.thumb | image_url: width: 1200, format: 'webp' }} 1200w{% endif %}" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt="{{ block.settings.title }}" loading="lazy" decoding="async" class="gallery__picture">${overlayHtml}${infoHtml}${iconHtml}</a>{%- endif -%}{%- endfor -%}`;

   galleryEl.removeAttribute("sf-gallery");
   galleryEl.set_content(liquidContent);

   const blocks = [
      {
         type: "gallery_image",
         name: "Gallery Image",
         settings: [
            { type: "image_picker", id: "thumb", label: "Thumbnail" },
            {
               type: "image_picker",
               id: "full",
               label: "Full Image (lightbox)",
            },
            { type: "text", id: "title", label: "Title" },
            { type: "text", id: "short_desc", label: "Short Description" },
            { type: "textarea", id: "full_caption", label: "Full Caption" },
            {
               type: "text",
               id: "default_thumb",
               label: "Default Thumbnail (asset)",
            },
            { type: "text", id: "default_full", label: "Default Full (asset)" },
         ],
      },
   ];

   return { blocks, presetBlocks };
}

// ── transformAccordion ───────────────────────────────────────────────────────
function transformAccordion(
   el: any,
   settings: any[],
): { blocks: any[]; presetBlocks: any[] } | null {
   const accordionEl = el.querySelector("[sf-accordion]");
   if (!accordionEl) return null;

   const items = accordionEl.querySelectorAll("[data-accordion-item]");
   if (!items.length) return null;

   console.log(`   🪗  Accordion [sf-accordion]: ${items.length} елементів`);

   const multiple = accordionEl.getAttribute("data-accordion-multiple");
   const duration = accordionEl.getAttribute("data-accordion-duration");
   const minWidth = accordionEl.getAttribute("data-accordion-min");
   const maxWidth = accordionEl.getAttribute("data-accordion-max");

   settings.push({
      type: "checkbox",
      id: "accordion_multiple",
      label: "Allow multiple open",
      default: multiple === "true",
   });
   settings.push({
      type: "range",
      id: "accordion_duration",
      label: "Animation duration (ms)",
      min: 100,
      max: 1000,
      step: 100,
      default: parseInt(duration ?? "400"),
   });
   settings.push({
      type: "text",
      id: "accordion_default_open",
      label: "Default open items (e.g. 0,1)",
      info: "Comma separated indexes, starts from 0",
   });
   if (minWidth)
      settings.push({
         type: "number",
         id: "accordion_min_width",
         label: "Min width (px)",
         default: parseInt(minWidth),
      });
   if (maxWidth)
      settings.push({
         type: "number",
         id: "accordion_max_width",
         label: "Max width (px)",
         default: parseInt(maxWidth),
      });

   const firstItem = items[0];
   const triggerEl = firstItem.querySelector("[data-accordion-trigger]");
   const triggerClass = triggerEl?.getAttribute("class") ?? "accordion__header";
   const titleEl = triggerEl?.querySelector("[sf-id]");
   const titleClass = titleEl?.getAttribute("class") ?? "accordion__title";
   const iconInTrigger = triggerEl?.querySelector("svg")?.outerHTML ?? "";
   const contentEl = firstItem.querySelector("[data-accordion-content]");
   const contentClass =
      contentEl?.getAttribute("class") ?? "accordion__content";
   const bodyEl = contentEl?.querySelector("[sf-id]") ?? contentEl?.firstChild;
   const bodyClass = bodyEl?.getAttribute?.("class") ?? "accordion__body";

   const hasAccordionGallery = !!contentEl?.querySelector("[sf-gallery]");
   let accordionGalleryHtml = "";

   if (hasAccordionGallery) {
      const galleryEl = contentEl.querySelector("[sf-gallery]");
      const galleryBodyClass =
         galleryEl?.getAttribute("class") ?? "gallery__body";
      const firstGalleryItem = galleryEl?.querySelector("a[data-fancybox]");
      const hasOverlay = !!firstGalleryItem?.querySelector(".gallery__overlay");
      const hasTitle = !!firstGalleryItem?.querySelector(".gallery__title");
      const hasDesc = !!firstGalleryItem?.querySelector(".gallery__desc");
      const hasIcon = !!firstGalleryItem?.querySelector(".gallery__icon");
      const iconInnerHtml =
         firstGalleryItem?.querySelector(".gallery__icon")?.innerHTML ?? "";
      const overlayHtml = hasOverlay
         ? `<div class="gallery__overlay"></div>`
         : "";
      const infoHtml =
         hasTitle || hasDesc
            ? `<div class="gallery__info">${hasTitle ? `<h3 class="gallery__title">{{ img.settings.title }}</h3>` : ""}${hasDesc ? `<p class="gallery__desc">{{ img.settings.short_desc }}</p>` : ""}</div>`
            : "";
      const iconHtml = hasIcon
         ? `<div class="gallery__icon">${iconInnerHtml}</div>`
         : "";
      accordionGalleryHtml = `<div class="${galleryBodyClass}">{%- assign item_idx = forloop.index -%}{%- for img in section.blocks -%}{%- if img.type == 'accordion_gallery_image' and img.settings.item_index == item_idx -%}<a data-fancybox="gallery-accordion-{{ item_idx }}" data-caption="{{ img.settings.full_caption }}" class="gallery__img" href="{% if img.settings.full %}{{ img.settings.full | image_url: width: 1600, format: 'webp' }}{% else %}{{ img.settings.default_full | asset_url }}{% endif %}" aria-label="{{ img.settings.title }}" {{ img.shopify_attributes }}><img src="{% if img.settings.thumb %}{{ img.settings.thumb | image_url: width: 800, format: 'webp' }}{% else %}{{ img.settings.default_thumb | asset_url }}{% endif %}" alt="{{ img.settings.title }}" loading="lazy" class="gallery__picture">${overlayHtml}${infoHtml}${iconHtml}</a>{%- endif -%}{%- endfor -%}</div>{% endif %}`;
      galleryEl.replaceWith("__ACCORDION_GALLERY__");
   }

   const presetBlocks = Array.from(items).map((item: any, index: number) => {
      const itemTitleEl = item.querySelector(
         "[data-accordion-trigger] [sf-id]",
      );
      const itemBodyEl = item.querySelector("[data-accordion-content] [sf-id]");
      const title = itemTitleEl?.innerText?.trim() ?? `Item ${index + 1}`;
      const content = itemBodyEl?.innerText?.trim() ?? "";
      return {
         type: "accordion_item",
         settings: { title, content: `<p>${content}</p>` },
      };
   });

   const bodyLiquid = hasAccordionGallery
      ? contentEl.innerHTML.replace(
           "__ACCORDION_GALLERY__",
           accordionGalleryHtml,
        )
      : `{% if block.settings.content != blank %}<div class="${bodyClass}">{{ block.settings.content }}</div>{% endif %}`;

   const itemLiquid = `{%- for block in section.blocks -%}{%- if block.type == 'accordion_item' -%}<div data-accordion-item class="accordion__item" {{ block.shopify_attributes }}><button data-accordion-trigger class="${triggerClass}"><span class="${titleClass}">{{ block.settings.title }}</span>${iconInTrigger}</button><div data-accordion-content class="${contentClass}">${bodyLiquid}</div></div>{%- endif -%}{%- endfor -%}`;

   accordionEl.removeAttribute("sf-accordion");
   accordionEl.setAttribute(
      "data-accordion-multiple",
      "{{ section.settings.accordion_multiple }}",
   );
   accordionEl.setAttribute(
      "data-accordion-duration",
      "{{ section.settings.accordion_duration }}",
   );
   accordionEl.setAttribute(
      "data-accordion-default",
      "{{ section.settings.accordion_default_open }}",
   );
   if (minWidth)
      accordionEl.setAttribute(
         "data-accordion-min",
         "{{ section.settings.accordion_min_width }}",
      );
   if (maxWidth)
      accordionEl.setAttribute(
         "data-accordion-max",
         "{{ section.settings.accordion_max_width }}",
      );
   accordionEl.set_content(itemLiquid);

   const blocks: any[] = [
      {
         type: "accordion_item",
         name: "Accordion Item",
         settings: [
            { type: "text", id: "title", label: "Title" },
            { type: "richtext", id: "content", label: "Content" },
         ],
      },
   ];

   if (hasAccordionGallery) {
      blocks.push({
         type: "accordion_gallery_image",
         name: "Gallery Image",
         settings: [
            {
               type: "number",
               id: "item_index",
               label: "Accordion Item Index (1, 2, 3...)",
               default: 1,
               info: "Which accordion item this image belongs to",
            },
            { type: "image_picker", id: "thumb", label: "Thumbnail" },
            {
               type: "image_picker",
               id: "full",
               label: "Full Image (lightbox)",
            },
            { type: "text", id: "title", label: "Title" },
            { type: "text", id: "short_desc", label: "Short Description" },
            { type: "textarea", id: "full_caption", label: "Full Caption" },
            {
               type: "text",
               id: "default_thumb",
               label: "Default Thumbnail (asset)",
            },
            { type: "text", id: "default_full", label: "Default Full (asset)" },
         ],
      });
   }

   return { blocks, presetBlocks };
}

// ── transformBlocks ───────────────────────────────────────────────────────────
function transformBlocks(
   containerEl: any,
   blockType: string,
   blockName: string,
): { blocks: any[]; presetBlocks: any[]; blockSettings: any[] } | null {
   const blockEls = containerEl.querySelectorAll("[sf-block]");
   if (!blockEls.length) return null;

   const allBlockElsSnapshot = Array.from(blockEls) as any[];
   console.log(
      `   📦  Blocks [${blockType}]: ${allBlockElsSnapshot.length} елементів`,
   );

   const firstBlock = allBlockElsSnapshot[0];
   const blockSettings: any[] = [];
   const seenIds = new Set<string>();

   const getSfNodes = (block: any, attr: string): any[] => {
      const nodes: any[] = [];
      if (block.getAttribute(attr)) nodes.push(block);
      nodes.push(...block.querySelectorAll(`[${attr}]`));
      return nodes;
   };

   for (const node of getSfNodes(firstBlock, "sf-id")) {
      const id = node.getAttribute("sf-id")!;
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      const type = node.getAttribute("sf-type") ?? inferType(node.tagName);
      blockSettings.push({ type, id, label: formatLabel(id) });
   }
   for (const node of getSfNodes(firstBlock, "sf-image")) {
      const id = node.getAttribute("sf-image")!;
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      blockSettings.push({
         type: "checkbox",
         id: `show_${id}`,
         label: `Show ${formatLabel(id)}`,
         default: true,
      });
      blockSettings.push({ type: "image_picker", id, label: formatLabel(id) });
      blockSettings.push({
         type: "text",
         id: `${id}_alt`,
         label: `${formatLabel(id)} Alt`,
      });
      blockSettings.push({
         type: "text",
         id: `default_${id}`,
         label: `Default ${formatLabel(id)} (asset)`,
      });
   }

   const presetBlocks = allBlockElsSnapshot.map((block: any) => {
      const settings: any = {};
      for (const node of getSfNodes(block, "sf-id")) {
         const id = node.getAttribute("sf-id")!;
         const type = node.getAttribute("sf-type") ?? inferType(node.tagName);
         settings[id] =
            type === "richtext"
               ? `<p>${node.innerText.trim()}</p>`
               : node.innerText.trim();
      }
      for (const node of getSfNodes(block, "sf-image")) {
         const id = node.getAttribute("sf-image")!;
         const origImg = node.querySelector("img");
         const src = origImg?.getAttribute("src") ?? "";
         settings[id + "_alt"] = origImg?.getAttribute("alt") ?? "";
         settings["default_" + id] = src.split("/").pop()?.split("?")[0] ?? "";
      }
      return { type: blockType, settings };
   });

   if (firstBlock.getAttribute("sf-id")) {
      const id = firstBlock.getAttribute("sf-id")!;
      firstBlock.set_content(`{{ block.settings.${id} }}`);
      firstBlock.removeAttribute("sf-id");
      firstBlock.removeAttribute("sf-type");
      firstBlock.removeAttribute("sf-label");
   }

   for (const node of firstBlock.querySelectorAll("[sf-id]")) {
      const id = node.getAttribute("sf-id")!;
      node.set_content(`{{ block.settings.${id} }}`);
      node.removeAttribute("sf-id");
      node.removeAttribute("sf-type");
      node.removeAttribute("sf-label");
      node.replaceWith(
         `{% if block.settings.${id} != blank %}${node.outerHTML}{% endif %}`,
      );
   }

   for (const node of getSfNodes(firstBlock, "sf-image")) {
      const id = node.getAttribute("sf-image")!;
      const cls = node.getAttribute("class") ?? "image-wrapper";
      const origImg = node.querySelector("img");
      const src = origImg?.getAttribute("src") ?? "";
      const defaultFileName = src.split("/").pop()?.split("?")[0] ?? "";
      const defaultImgHtml = defaultFileName
         ? `<div class="${cls}"><img src="{{ '${defaultFileName}' | asset_url }}" alt="{{ block.settings.${id}_alt }}" loading="lazy"></div>`
         : "";
      node.removeAttribute("sf-image");
      node.replaceWith(
         `{% if block.settings.show_${id} %}{% if block.settings.${id} %}<div class="${cls}"><img src="{{ block.settings.${id} | image_url: width: 800, format: 'webp' }}" alt="{{ block.settings.${id}_alt }}" loading="lazy"></div>{% else %}${defaultImgHtml}{% endif %}{% endif %}`,
      );
   }

   firstBlock.removeAttribute("sf-block");
   const itemLiquidTemplate = firstBlock.outerHTML;
   const liquidContent = `{%- for block in section.blocks -%}{%- if block.type == '${blockType}' -%}${itemLiquidTemplate}{%- endif -%}{%- endfor -%}`;

   if (allBlockElsSnapshot.length > 0) {
      allBlockElsSnapshot[0].replaceWith(liquidContent);
      for (let i = 1; i < allBlockElsSnapshot.length; i++) {
         allBlockElsSnapshot[i].remove();
      }
   }

   const blocks = [
      { type: blockType, name: blockName, settings: blockSettings },
   ];
   return { blocks, presetBlocks, blockSettings };
}

// ── transformCounters ────────────────────────────────────────────────────────
function transformCounters(
   el: any,
): { blocks: any[]; presetBlocks: any[] } | null {
   const counterEls = el.querySelectorAll("[sf-block][data-counter-target]");
   if (!counterEls.length) return null;

   const allCounterEls = Array.from(counterEls) as any[];
   console.log(`   🔢  Counters: ${allCounterEls.length} елементів`);

   const presetBlocks = allCounterEls.map((counter: any) => {
      const settings: any = {
         counter_target: parseFloat(
            counter.getAttribute("data-counter-target") ?? "0",
         ),
         counter_start: parseFloat(
            counter.getAttribute("data-counter-start") ?? "0",
         ),
         counter_duration: parseInt(
            counter.getAttribute("data-counter-duration") ?? "2000",
         ),
         counter_easing:
            counter.getAttribute("data-counter-easing") ?? "ease-out",
         counter_prefix: counter.getAttribute("data-counter-prefix") ?? "",
         counter_suffix: counter.getAttribute("data-counter-suffix") ?? "",
         counter_short: counter.getAttribute("data-counter-short") === "true",
         counter_once: counter.hasAttribute("data-watch-once"),
      };
      if (counter.getAttribute("data-counter-locale"))
         settings.counter_locale = counter.getAttribute("data-counter-locale");
      if (counter.getAttribute("data-counter-decimals") !== null)
         settings.counter_decimals = parseInt(
            counter.getAttribute("data-counter-decimals"),
         );
      if (counter.getAttribute("data-counter-thousands") !== null)
         settings.counter_thousands = counter.getAttribute(
            "data-counter-thousands",
         );
      if (counter.getAttribute("data-counter-decimal") !== null)
         settings.counter_decimal = counter.getAttribute(
            "data-counter-decimal",
         );
      return { type: "counter_item", settings };
   });

   const firstCounter = allCounterEls[0];
   const cls = firstCounter.getAttribute("class") ?? "counter";
   const liquidItem = `<div class="${cls}" {% if block.settings.counter_once %}data-watch-once{% else %}data-watch{% endif %} data-counter-target="{{ block.settings.counter_target }}" data-counter-start="{{ block.settings.counter_start }}" data-counter-duration="{{ block.settings.counter_duration }}" data-counter-easing="{{ block.settings.counter_easing }}"{% if block.settings.counter_prefix != blank %} data-counter-prefix="{{ block.settings.counter_prefix }}"{% endif %}{% if block.settings.counter_suffix != blank %} data-counter-suffix="{{ block.settings.counter_suffix }}"{% endif %}{% if block.settings.counter_short %} data-counter-short="true"{% endif %}{% if block.settings.counter_locale != blank %} data-counter-locale="{{ block.settings.counter_locale }}"{% endif %}{% if block.settings.counter_decimals %} data-counter-decimals="{{ block.settings.counter_decimals }}"{% endif %}{% if block.settings.counter_thousands != blank %} data-counter-thousands="{{ block.settings.counter_thousands }}"{% endif %}{% if block.settings.counter_decimal != blank %} data-counter-decimal="{{ block.settings.counter_decimal }}"{% endif %} {{ block.shopify_attributes }}>{{ block.settings.counter_start }}</div>`;
   const liquidContent = `{%- for block in section.blocks -%}{%- if block.type == 'counter_item' -%}${liquidItem}{%- endif -%}{%- endfor -%}`;

   allCounterEls[0].replaceWith(liquidContent);
   for (let i = 1; i < allCounterEls.length; i++) allCounterEls[i].remove();

   const blocks = [
      {
         type: "counter_item",
         name: "Counter",
         settings: [
            { type: "header", content: "Counter Settings" },
            {
               type: "number",
               id: "counter_target",
               label: "Target Number",
               default: 1000,
            },
            {
               type: "number",
               id: "counter_start",
               label: "Start Number",
               default: 0,
            },
            {
               type: "number",
               id: "counter_duration",
               label: "Duration (ms)",
               default: 2000,
            },
            {
               type: "select",
               id: "counter_easing",
               label: "Easing",
               options: [
                  { value: "linear", label: "Linear" },
                  { value: "ease-in", label: "Ease In" },
                  { value: "ease-out", label: "Ease Out" },
                  { value: "ease-in-out", label: "Ease In Out" },
               ],
               default: "ease-out",
            },
            {
               type: "checkbox",
               id: "counter_once",
               label: "Animate once",
               default: true,
            },
            { type: "header", content: "Format" },
            {
               type: "text",
               id: "counter_prefix",
               label: "Prefix (e.g. $, €, ₴)",
            },
            {
               type: "text",
               id: "counter_suffix",
               label: "Suffix (e.g. +, %, K)",
            },
            {
               type: "checkbox",
               id: "counter_short",
               label: "Short format (K, M, B)",
               default: false,
            },
            {
               type: "text",
               id: "counter_locale",
               label: "Locale (e.g. en-US, uk-UA)",
            },
            { type: "number", id: "counter_decimals", label: "Decimal places" },
            {
               type: "text",
               id: "counter_thousands",
               label: "Thousands separator",
            },
            { type: "text", id: "counter_decimal", label: "Decimal separator" },
         ],
      },
   ];

   return { blocks, presetBlocks };
}

// ── transformMarquee ─────────────────────────────────────────────────────────
function transformMarquee(
   el: any,
   settings: any[],
): { blocks: any[]; presetBlocks: any[] } | null {
   const marqueeEl = el.querySelector("[sf-marquee]");
   if (!marqueeEl) return null;

   const hasBlocks = marqueeEl.querySelector("[sf-block]");
   if (!hasBlocks) return null;

   console.log(`   🎢  Marquee [sf-marquee]`);

   const speed = marqueeEl.getAttribute("data-marquee-speed") ?? "10";
   const speedTablet =
      marqueeEl.getAttribute("data-marquee-speed-tablet") ?? speed;
   const speedMobile =
      marqueeEl.getAttribute("data-marquee-speed-mobile") ?? speed;
   const space = marqueeEl.getAttribute("data-marquee-space") ?? "30";
   const spaceTablet =
      marqueeEl.getAttribute("data-marquee-space-tablet") ?? space;
   const spaceMobile =
      marqueeEl.getAttribute("data-marquee-space-mobile") ?? space;
   const direction = marqueeEl.getAttribute("data-marquee-direction") ?? "left";
   const pauseOnHover = marqueeEl.hasAttribute("data-marquee-pause");

   settings.push({ type: "header", content: "Marquee Settings" });
   settings.push({
      type: "select",
      id: "marquee_direction",
      label: "Direction",
      options: [
         { value: "left", label: "Left" },
         { value: "right", label: "Right" },
         { value: "top", label: "Top" },
         { value: "bottom", label: "Bottom" },
      ],
      default: direction,
   });
   settings.push({
      type: "checkbox",
      id: "marquee_pause_on_hover",
      label: "Pause on hover",
      default: pauseOnHover,
   });
   settings.push({ type: "header", content: "Speed" });
   settings.push({
      type: "number",
      id: "marquee_speed",
      label: "Speed Desktop",
      default: parseInt(speed),
   });
   settings.push({
      type: "number",
      id: "marquee_speed_tablet",
      label: "Speed Tablet",
      default: parseInt(speedTablet),
   });
   settings.push({
      type: "number",
      id: "marquee_speed_mobile",
      label: "Speed Mobile",
      default: parseInt(speedMobile),
   });
   settings.push({ type: "header", content: "Space between items" });
   settings.push({
      type: "number",
      id: "marquee_space",
      label: "Space Desktop",
      default: parseInt(space),
   });
   settings.push({
      type: "number",
      id: "marquee_space_tablet",
      label: "Space Tablet",
      default: parseInt(spaceTablet),
   });
   settings.push({
      type: "number",
      id: "marquee_space_mobile",
      label: "Space Mobile",
      default: parseInt(spaceMobile),
   });

   marqueeEl.removeAttribute("sf-marquee");
   marqueeEl.setAttribute(
      "data-marquee-direction",
      "{{ section.settings.marquee_direction }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-speed",
      "{{ section.settings.marquee_speed }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-speed-tablet",
      "{{ section.settings.marquee_speed_tablet }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-speed-mobile",
      "{{ section.settings.marquee_speed_mobile }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-space",
      "{{ section.settings.marquee_space }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-space-tablet",
      "{{ section.settings.marquee_space_tablet }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-space-mobile",
      "{{ section.settings.marquee_space_mobile }}",
   );
   marqueeEl.setAttribute(
      "data-marquee-pause",
      "{{ section.settings.marquee_pause_on_hover }}",
   );

   const blocksResult = transformBlocks(
      marqueeEl,
      "marquee_item",
      "Marquee Item",
   );
   if (!blocksResult) return null;

   return {
      blocks: blocksResult.blocks,
      presetBlocks: blocksResult.presetBlocks,
   };
}

// ── transformTabs ─────────────────────────────────────────────────────────────
function transformTabs(
   el: any,
   settings: any[],
): { blocks: any[]; presetBlocks: any[] } | null {
   const tabsEl = el.querySelector("[sf-tabs]");
   if (!tabsEl) return null;

   const buttons = tabsEl.querySelectorAll("[data-tab]");
   const panels = tabsEl.querySelectorAll("[data-tab-content]");
   if (!buttons.length) return null;

   console.log(`   🗂️  Tabs [sf-tabs]: ${buttons.length} табів`);

   const animation = tabsEl.getAttribute("data-animation") ?? "none";
   const animationDuration =
      tabsEl.getAttribute("data-animation-duration") ?? "300";
   const indicator = tabsEl.getAttribute("data-indicator") === "true";
   const indicatorMinWidth = tabsEl.getAttribute("data-indicator-min-width");
   const indicatorMaxWidth = tabsEl.getAttribute("data-indicator-max-width");
   const scrollable = tabsEl.getAttribute("data-scrollable") === "true";

   settings.push({ type: "header", content: "Tabs Settings" });
   settings.push({
      type: "select",
      id: "tabs_animation",
      label: "Animation",
      options: [
         { value: "none", label: "None" },
         { value: "fade", label: "Fade" },
         { value: "slide", label: "Slide" },
         { value: "scale", label: "Scale" },
         { value: "flip", label: "Flip" },
      ],
      default: animation,
   });
   settings.push({
      type: "number",
      id: "tabs_animation_duration",
      label: "Animation Duration (ms)",
      default: parseInt(animationDuration),
   });
   settings.push({
      type: "checkbox",
      id: "tabs_scrollable",
      label: "Scrollable navigation",
      default: scrollable,
   });
   settings.push({
      type: "checkbox",
      id: "tabs_indicator",
      label: "Show indicator",
      default: indicator,
   });
   if (indicatorMinWidth)
      settings.push({
         type: "number",
         id: "tabs_indicator_min_width",
         label: "Indicator min width (px)",
         default: parseInt(indicatorMinWidth),
      });
   if (indicatorMaxWidth)
      settings.push({
         type: "number",
         id: "tabs_indicator_max_width",
         label: "Indicator max width (px)",
         default: parseInt(indicatorMaxWidth),
      });
   settings.push({
      type: "number",
      id: "tabs_default_tab",
      label: "Default open tab (index, starts from 1)",
      default: 1,
   });

   const presetBlocks = Array.from(buttons).map((btn: any, index: number) => {
      const tabId = btn.getAttribute("data-tab") ?? `tab${index + 1}`;
      const tabTitle = btn.innerText?.trim() ?? `Tab ${index + 1}`;
      const panel = tabsEl.querySelector(`[data-tab-content="${tabId}"]`);
      const settings: any = { tab_title: tabTitle };
      if (panel) {
         for (const node of panel.querySelectorAll("[sf-id]")) {
            const id = node.getAttribute("sf-id")!;
            const type =
               node.getAttribute("sf-type") ?? inferType(node.tagName);
            settings[id] =
               type === "richtext"
                  ? `<p>${node.innerText?.trim() ?? ""}</p>`
                  : (node.innerText?.trim() ?? "");
         }
      }
      return { type: "tab_item", settings };
   });

   const firstBtn = buttons[0];
   const btnClass = firstBtn.getAttribute("class") ?? "tabs__button";
   const btnLiquid = `{%- for block in section.blocks -%}{%- if block.type == 'tab_item' -%}<button class="${btnClass}" data-tab="tab-{{ forloop.index }}" {{ block.shopify_attributes }}>{{ block.settings.tab_title }}</button>{%- endif -%}{%- endfor -%}`;

   const firstPanel = panels[0];
   const panelClass = firstPanel?.getAttribute("class") ?? "tabs__panel";
   const panelSettings: any[] = [];
   const panelSeenIds = new Set<string>();

   for (const node of firstPanel?.querySelectorAll("[sf-id]") ?? []) {
      const id = node.getAttribute("sf-id")!;
      if (panelSeenIds.has(id)) continue;
      panelSeenIds.add(id);
      const type = node.getAttribute("sf-type") ?? inferType(node.tagName);
      panelSettings.push({ type, id, label: formatLabel(id) });
      node.removeAttribute("sf-id");
      node.removeAttribute("sf-type");
      node.removeAttribute("sf-label");
      node.set_content(`{{ block.settings.${id} }}`);
      node.replaceWith(
         `{% if block.settings.${id} != blank %}${node.outerHTML}{% endif %}`,
      );
   }

   for (const node of firstPanel?.querySelectorAll("[sf-image]") ?? []) {
      const id = node.getAttribute("sf-image")!;
      if (panelSeenIds.has(id)) continue;
      panelSeenIds.add(id);
      panelSettings.push({
         type: "checkbox",
         id: `show_${id}`,
         label: `Show ${formatLabel(id)}`,
         default: true,
      });
      panelSettings.push({ type: "image_picker", id, label: formatLabel(id) });
      panelSettings.push({
         type: "text",
         id: `${id}_alt`,
         label: `${formatLabel(id)} Alt`,
      });
      const cls = node.getAttribute("class") ?? "image-wrapper";
      const origImg = node.querySelector("img");
      const src = origImg?.getAttribute("src") ?? "";
      const defaultFileName = src.split("/").pop()?.split("?")[0] ?? "";
      const defaultImgHtml = defaultFileName
         ? `<div class="${cls}"><img src="{{ '${defaultFileName}' | asset_url }}" alt="{{ block.settings.${id}_alt }}" loading="lazy"></div>`
         : "";
      node.removeAttribute("sf-image");
      node.replaceWith(
         `{% if block.settings.show_${id} %}{% if block.settings.${id} %}<div class="${cls}"><img src="{{ block.settings.${id} | image_url: width: 1200, format: 'webp' }}" alt="{{ block.settings.${id}_alt }}" loading="lazy"></div>{% else %}${defaultImgHtml}{% endif %}{% endif %}`,
      );
   }

   const hasTabGallery = !!firstPanel?.querySelector("[sf-gallery]");
   let galleryBodyHtml = "";
   let galleryBodyClass = "gallery__body";

   if (hasTabGallery) {
      const galleryEl = firstPanel.querySelector("[sf-gallery]");
      galleryBodyClass = galleryEl?.getAttribute("class") ?? "gallery__body";
      const firstGalleryItem = galleryEl?.querySelector("a[data-fancybox]");
      const hasOverlay = !!firstGalleryItem?.querySelector(".gallery__overlay");
      const hasTitle = !!firstGalleryItem?.querySelector(".gallery__title");
      const hasDesc = !!firstGalleryItem?.querySelector(".gallery__desc");
      const hasIcon = !!firstGalleryItem?.querySelector(".gallery__icon");
      const iconInnerHtml =
         firstGalleryItem?.querySelector(".gallery__icon")?.innerHTML ?? "";
      const overlayHtml = hasOverlay
         ? `<div class="gallery__overlay"></div>`
         : "";
      const infoHtml =
         hasTitle || hasDesc
            ? `<div class="gallery__info">${hasTitle ? `<h3 class="gallery__title">{{ img.settings.title }}</h3>` : ""}${hasDesc ? `<p class="gallery__desc">{{ img.settings.short_desc }}</p>` : ""}</div>`
            : "";
      const iconHtml = hasIcon
         ? `<div class="gallery__icon">${iconInnerHtml}</div>`
         : "";
      galleryBodyHtml = `{%- capture gallery_content -%}{%- assign tab_idx = forloop.index -%}{%- for img in section.blocks -%}{%- if img.type == 'tab_gallery_image' and img.settings.tab_index == tab_idx -%}<a data-fancybox="gallery-tab-{{ tab_idx }}" data-caption="{{ img.settings.full_caption }}" class="gallery__img" href="{% if img.settings.full %}{{ img.settings.full | image_url: width: 1600, format: 'webp' }}{% else %}{{ img.settings.default_full | asset_url }}{% endif %}" aria-label="{{ img.settings.title }}" {{ img.shopify_attributes }}><img src="{% if img.settings.thumb %}{{ img.settings.thumb | image_url: width: 800, format: 'webp' }}{% else %}{{ img.settings.default_thumb | asset_url }}{% endif %}" alt="{{ img.settings.title }}" loading="lazy" class="gallery__picture">${overlayHtml}${infoHtml}${iconHtml}</a>{%- endif -%}{%- endfor -%}{%- endcapture -%}{% if gallery_content != blank %}<div class="${galleryBodyClass}">{{ gallery_content }}</div>{% endif %}`;
      galleryEl.replaceWith("__GALLERY_PLACEHOLDER__");
   }

   const panelInnerLiquid =
      panelSettings.length > 0 || hasTabGallery
         ? (firstPanel?.innerHTML ?? "").replace(
              "__GALLERY_PLACEHOLDER__",
              galleryBodyHtml,
           )
         : "{{ block.settings.tab_content }}";

   const panelLiquid = `{%- for block in section.blocks -%}{%- if block.type == 'tab_item' -%}<div class="${panelClass}" data-tab-content="tab-{{ forloop.index }}">${panelInnerLiquid}</div>{%- endif -%}{%- endfor -%}`;

   tabsEl.removeAttribute("sf-tabs");
   tabsEl.setAttribute(
      "data-animation",
      "{{ section.settings.tabs_animation }}",
   );
   tabsEl.setAttribute(
      "data-animation-duration",
      "{{ section.settings.tabs_animation_duration }}",
   );
   tabsEl.setAttribute(
      "data-scrollable",
      "{{ section.settings.tabs_scrollable }}",
   );
   tabsEl.setAttribute(
      "data-indicator",
      "{{ section.settings.tabs_indicator }}",
   );
   tabsEl.setAttribute(
      "data-default-tab",
      "tab-{{ section.settings.tabs_default_tab }}",
   );
   if (indicatorMinWidth)
      tabsEl.setAttribute(
         "data-indicator-min-width",
         "{{ section.settings.tabs_indicator_min_width }}",
      );
   if (indicatorMaxWidth)
      tabsEl.setAttribute(
         "data-indicator-max-width",
         "{{ section.settings.tabs_indicator_max_width }}",
      );

   const navEl = tabsEl.querySelector(".tabs__nav");
   if (navEl) {
      for (const btn of navEl.querySelectorAll("[data-tab]")) btn.remove();
      const indicator_el = navEl.querySelector(".tabs__indicator");
      if (indicator_el) {
         indicator_el.replaceWith(
            `${btnLiquid}{% if section.settings.tabs_indicator %}<div class="tabs__indicator" aria-hidden="true"></div>{% endif %}`,
         );
      } else {
         navEl.set_content(btnLiquid);
      }
   }

   const arrowLeft = tabsEl.querySelector(".tabs__arrow--left");
   const arrowRight = tabsEl.querySelector(".tabs__arrow--right");
   if (arrowLeft) {
      const h = arrowLeft.outerHTML;
      arrowLeft.replaceWith(
         `{% if section.settings.tabs_scrollable %}${h}{% endif %}`,
      );
   }
   if (arrowRight) {
      const h = arrowRight.outerHTML;
      arrowRight.replaceWith(
         `{% if section.settings.tabs_scrollable %}${h}{% endif %}`,
      );
   }

   const contentEl = tabsEl.querySelector(".tabs__content");
   if (contentEl) contentEl.set_content(panelLiquid);

   const blockSchemaSettings: any[] = [
      { type: "text", id: "tab_title", label: "Tab Title" },
      ...panelSettings,
   ];

   const blocks: any[] = [
      { type: "tab_item", name: "Tab Item", settings: blockSchemaSettings },
   ];

   if (hasTabGallery) {
      blocks.push({
         type: "tab_gallery_image",
         name: "Gallery Image",
         settings: [
            {
               type: "number",
               id: "tab_index",
               label: "Tab Index (1, 2, 3...)",
               default: 1,
               info: "Which tab this image belongs to",
            },
            { type: "image_picker", id: "thumb", label: "Thumbnail" },
            {
               type: "image_picker",
               id: "full",
               label: "Full Image (lightbox)",
            },
            { type: "text", id: "title", label: "Title" },
            { type: "text", id: "short_desc", label: "Short Description" },
            { type: "textarea", id: "full_caption", label: "Full Caption" },
            {
               type: "text",
               id: "default_thumb",
               label: "Default Thumbnail (asset)",
            },
            { type: "text", id: "default_full", label: "Default Full (asset)" },
         ],
      });
   }

   return { blocks, presetBlocks };
}

// ── PRODUCT FIELDS MAP ───────────────────────────────────────────────────────
// Маппінг sf-product → Liquid для сторінки товару
const PRODUCT_FIELDS: Record<string, { attr?: string; liquid: string }> = {
   title: { liquid: `{{ product.title }}{% unless product.has_only_default_variant %} — {{ product.selected_or_first_available_variant.title }}{% endunless %}` },
   price: { liquid: `{{ product.selected_or_first_available_variant.price | money }}` },
   compare_price: {
      liquid: `{% assign _variant = product.selected_or_first_available_variant %}{% if _variant.compare_at_price > _variant.price %}{{ _variant.compare_at_price | money }}{% endif %}`,
   },
   discount_badge: {
      liquid: `{%- if section.settings.show_discount -%}{%- assign _v = product.selected_or_first_available_variant -%}{%- if _v.compare_at_price > _v.price -%}{%- assign _pct = _v.compare_at_price | minus: _v.price | times: 100 | divided_by: _v.compare_at_price -%}-{{ _pct }}%{%- endif -%}{%- endif -%}`,
   },
   short_description: {
      liquid: `{%- if section.settings.show_short_desc -%}{{ product.metafields.custom.short_description.value }}{%- endif -%}`,
   },
   description: { liquid: `{{ product.description }}` },
   specs: {
      liquid: `{%- if section.settings.show_tab_specs -%}{{ product.metafields.custom.specs | metafield_tag }}{%- endif -%}`,
   },
   sku: {
      liquid: `{%- if section.settings.show_sku and product.selected_or_first_available_variant.sku != blank -%}<span class="product-detail__sku-label">SKU:</span> <span class="product-detail__sku-value" data-product-sku>{{ product.selected_or_first_available_variant.sku }}</span>{%- endif -%}`,
   },
   vendor: { liquid: `{{ product.vendor }}` },
   type: { liquid: `{{ product.type }}` },
   url: { attr: "href", liquid: `{{ product.url }}` },
   image: {
      attr: "src",
      liquid: `{{ product.featured_image | image_url: width: 1200, format: 'webp' }}`,
   },
};

// ── transformProduct ──────────────────────────────────────────────────────────
// Знаходить [sf-product="field"] → замінює на Liquid вираз
// Використовується на сторінці товару (sf-template="product")
//
// Приклад:
//   <h1 sf-product="title">iPhone 17</h1>         → <h1>{{ product.title }}</h1>
//   <p sf-product="price">₴59,200</p>             → <p>{{ product.price | money }}</p>
//   <img sf-product="image" src={img} alt="" />   → <img src="{{ product.featured_image | ... }}" alt="{{ product.title }}" />
//   <a sf-product="url" href="#">Купити</a>        → <a href="{{ product.url }}">Купити</a>
function transformProduct(el: any, settings: any[]): { blocks: any[]; presetBlocks: any[] } | null {
   const nodes = el.querySelectorAll("[sf-product]");
   if (!nodes.length) return null;

   console.log(`   🛍️  Product fields: ${nodes.length} елементів`);

   for (const node of nodes) {
      const field = node.getAttribute("sf-product")!;
      const mapping = PRODUCT_FIELDS[field];
      node.removeAttribute("sf-product");

      if (!mapping) {
         console.warn(`   ⚠️  sf-product="${field}" — невідоме поле`);
         continue;
      }

      if (mapping.attr === "src") {
         // Зображення — замінюємо src і додаємо alt + srcset
         node.setAttribute("src", mapping.liquid);
         node.setAttribute(
            "srcset",
            `{{ product.featured_image | image_url: width: 400, format: 'webp' }} 400w, {{ product.featured_image | image_url: width: 800, format: 'webp' }} 800w, {{ product.featured_image | image_url: width: 1200, format: 'webp' }} 1200w`,
         );
         node.setAttribute("sizes", "(max-width: 768px) 100vw, 50vw");
         node.setAttribute(
            "alt",
            `{{ product.featured_image.alt | default: product.title }}`,
         );
         node.setAttribute("width", `{{ product.featured_image.width }}`);
         node.setAttribute("height", `{{ product.featured_image.height }}`);
      } else if (mapping.attr === "href") {
         // Посилання — замінюємо href
         node.setAttribute("href", mapping.liquid);
      } else {
         // Текстовий контент — замінюємо вміст
         // Для title — додаємо data-base-title щоб JS міг оновлювати при зміні варіанту
         if (field === "title") {
            node.setAttribute("data-base-title", `{{ product.title }}`);
         }
         // Для price — додаємо формат грошей магазину
         if (field === "price" && node.hasAttribute("data-money-format")) {
            node.setAttribute("data-money-format", `{{ shop.money_format }}`);
         }
         node.set_content(mapping.liquid);
      }
   }

   // ── Gallery admin settings + data-* overrides ────────────────────────────
   const galleryRootEl = el.querySelector(".product-gallery");
   if (galleryRootEl) {
      settings.push({ type: "header", content: "── Gallery ──" });
      settings.push({ type: "checkbox", id: "gallery_fancybox", label: "Enable Fancybox lightbox", default: true });
      settings.push({
         type: "select", id: "gallery_thumbs_position", label: "Thumbnails position",
         options: [
            { value: "bottom", label: "Bottom" },
            { value: "left",   label: "Left"   },
            { value: "right",  label: "Right"  },
            { value: "none",   label: "Hidden" },
         ],
         default: "bottom",
      });
      settings.push({ type: "text", id: "gallery_main_ratio", label: "Main image aspect ratio (e.g. 4/3, 16/9, auto)", default: "auto" });
      settings.push({ type: "range", id: "gallery_max_visible", label: "Visible thumbnails", min: 2, max: 10, step: 1, default: 4 });
      settings.push({ type: "text", id: "gallery_thumb_ratio", label: "Thumb aspect ratio (e.g. 1/1, 4/3, 3/4)", default: "1/1" });
      settings.push({ type: "range", id: "gallery_thumb_gap", label: "Thumb gap", min: 0, max: 30, step: 2, default: 8, unit: "px" });
      settings.push({ type: "range", id: "gallery_thumb_radius", label: "Thumb border-radius", min: 0, max: 24, step: 1, default: 6, unit: "px" });
      settings.push({ type: "checkbox", id: "gallery_thumb_scale", label: "Hover scale on thumbs", default: false });
      settings.push({ type: "checkbox", id: "gallery_thumb_arrows", label: "Show arrows on thumbs", default: false });
      console.log(`   ⚙️  Product gallery settings added`);

      galleryRootEl.setAttribute("data-gallery-fancybox", "{{ section.settings.gallery_fancybox }}");
      galleryRootEl.setAttribute("data-thumbs-position", "{{ section.settings.gallery_thumbs_position }}");
      galleryRootEl.setAttribute("data-is-row", "{% if section.settings.gallery_thumbs_position == 'left' or section.settings.gallery_thumbs_position == 'right' %}true{% else %}false{% endif %}");
      galleryRootEl.setAttribute("data-needs-slider", "true");
      galleryRootEl.setAttribute("data-max-visible", "{{ section.settings.gallery_max_visible }}");
      galleryRootEl.setAttribute("data-thumb-gap", "{{ section.settings.gallery_thumb_gap }}");
      galleryRootEl.setAttribute("data-thumb-radius", "{{ section.settings.gallery_thumb_radius }}");
      galleryRootEl.setAttribute("data-thumb-scale", "{{ section.settings.gallery_thumb_scale }}");
      galleryRootEl.setAttribute("data-thumb-arrows", "{{ section.settings.gallery_thumb_arrows }}");
      galleryRootEl.setAttribute("data-thumb-ratio", "{{ section.settings.gallery_thumb_ratio }}");
      galleryRootEl.setAttribute("data-main-ratio",  "{{ section.settings.gallery_main_ratio }}");
   }

   // ── Галерея мініатюр [sf-product-gallery] ────────────────────────────────
   // <div sf-product-gallery class="product-page__thumbs">
   //   <img src={Thumb} alt="" class="product-page__thumb" />  ← шаблон одної мініатюри
   // </div>
   const galleryEls = el.querySelectorAll("[sf-product-gallery]");
   for (const galleryEl of galleryEls) {
      const mode = galleryEl.getAttribute("sf-product-gallery") ?? "";
      galleryEl.removeAttribute("sf-product-gallery");

      if (mode === "main") {
         const slideEl = galleryEl.querySelector(".swiper-slide");
         const imgEl =
            slideEl?.querySelector("img") ?? galleryEl.querySelector("img");
         const imgClass = imgEl?.getAttribute("class") ?? "img";
         const slideClass = slideEl?.getAttribute("class") ?? "swiper-slide";

         const slideFromImage = `<div class="${slideClass}" data-image-id="{{ image.id }}">{% if section.settings.gallery_fancybox %}<a data-fancybox="product-gallery" href="{{ image | image_url: width: 2000, format: 'webp' }}" data-caption="{{ image.alt | default: product.title | escape }}">{% endif %}<img src="{{ image | image_url: width: 1200, format: 'webp' }}" srcset="{{ image | image_url: width: 400, format: 'webp' }} 400w, {{ image | image_url: width: 800, format: 'webp' }} 800w, {{ image | image_url: width: 1200, format: 'webp' }} 1200w" sizes="(max-width: 768px) 100vw, 50vw" alt="{{ image.alt | default: product.title }}" class="${imgClass}" loading="lazy" width="{{ image.width | default: 0 }}" height="{{ image.height | default: 0 }}">{% if section.settings.gallery_fancybox %}</a>{% endif %}</div>`;
         const slideFromFile  = `<div class="${slideClass}" data-image-id="{{ file.id }}">{% if section.settings.gallery_fancybox %}<a data-fancybox="product-gallery" href="{{ file | image_url: width: 2000, format: 'webp' }}" data-caption="{{ file.alt | default: product.title | escape }}">{% endif %}<img src="{{ file | image_url: width: 1200, format: 'webp' }}" srcset="{{ file | image_url: width: 400, format: 'webp' }} 400w, {{ file | image_url: width: 800, format: 'webp' }} 800w, {{ file | image_url: width: 1200, format: 'webp' }} 1200w" sizes="(max-width: 768px) 100vw, 50vw" alt="{{ file.alt | default: product.title }}" class="${imgClass}" loading="lazy" width="{{ file.width | default: 0 }}" height="{{ file.height | default: 0 }}">{% if section.settings.gallery_fancybox %}</a>{% endif %}</div>`;

         // SSR: show variant gallery on initial load to avoid flash of wrong images
         const liquidContent = `{%- assign _sv = product.selected_or_first_available_variant -%}{%- assign _svg = _sv.metafields.custom.gallery.value -%}{%- if _svg != blank -%}{%- for file in _svg -%}${slideFromFile}{%- endfor -%}{%- else -%}{%- for image in product.images -%}${slideFromImage}{%- endfor -%}{%- endif -%}`;
         galleryEl.set_content(liquidContent);
         console.log(
            `   🖼️  Product gallery main → Liquid loop (swiper-slide)`,
         );
      } else {
         const thumbEl = galleryEl.querySelector("img");
         const thumbClass = thumbEl?.getAttribute("class") ?? "img";
         const slideClass =
            galleryEl.querySelector(".swiper-slide")?.getAttribute("class") ??
            "swiper-slide";

         const thumbFromImage = `<div class="${slideClass}"><img src="{{ image | image_url: width: 200, format: 'webp' }}" alt="{{ image.alt | default: product.title }}" class="${thumbClass}" loading="lazy" data-src="{{ image | image_url: width: 1200, format: 'webp' }}"></div>`;
         const thumbFromFile  = `<div class="${slideClass}"><img src="{{ file | image_url: width: 200, format: 'webp' }}" alt="{{ file.alt | default: product.title }}" class="${thumbClass}" loading="lazy" data-src="{{ file | image_url: width: 1200, format: 'webp' }}"></div>`;

         // SSR: match initial variant gallery for thumbs too
         const liquidContent = `{%- assign _sv = product.selected_or_first_available_variant -%}{%- assign _svg = _sv.metafields.custom.gallery.value -%}{%- if _svg != blank -%}{%- for file in _svg -%}${thumbFromFile}{%- endfor -%}{%- else -%}{%- for image in product.images -%}${thumbFromImage}{%- endfor -%}{%- endif -%}`;
         galleryEl.set_content(liquidContent);
         console.log(
            `   🖼️  Product gallery thumbs → Liquid loop (swiper-slide)`,
         );
      }
   }

   // ── Variant gallery JSON data [sf-product-gallery-data] ──────────────────
   const galleryDataEl = el.querySelector("[sf-product-gallery-data]");
   if (galleryDataEl) {
      const allImagesLiq = `{%- for image in product.images -%}{"id":"{{ image.id }}","src":"{{ image | image_url: width: 1200, format: 'webp' }}","thumb":"{{ image | image_url: width: 200, format: 'webp' }}","srcset":"{{ image | image_url: width: 400, format: 'webp' }} 400w, {{ image | image_url: width: 800, format: 'webp' }} 800w, {{ image | image_url: width: 1200, format: 'webp' }} 1200w","alt":"{{ image.alt | default: product.title | escape }}","width":{{ image.width | default: 0 }},"height":{{ image.height | default: 0 }}}{% unless forloop.last %},{% endunless %}{%- endfor -%}`;
      const variantFileLiq = `{"src":"{{ file | image_url: width: 1200, format: 'webp' }}","thumb":"{{ file | image_url: width: 200, format: 'webp' }}","srcset":"{{ file | image_url: width: 400, format: 'webp' }} 400w, {{ file | image_url: width: 800, format: 'webp' }} 800w, {{ file | image_url: width: 1200, format: 'webp' }} 1200w","alt":"{{ file.alt | default: '' | escape }}","width":{{ file.width | default: 0 }},"height":{{ file.height | default: 0 }}}`;
      // variantGalleries is an ARRAY (not object) to avoid { + {%- = {{%- Liquid collision
      const variantGalleriesLiq = `[{%- for variant in product.variants -%}{%- assign vg = variant.metafields.custom.gallery.value -%}{"id":"{{ variant.id }}","images":{%- if vg != blank -%}[{%- for file in vg -%}${variantFileLiq}{% unless forloop.last %},{% endunless %}{%- endfor -%}]{%- else -%}null{%- endif -%}}{% unless forloop.last %},{% endunless %}{%- endfor -%}]`;
      // Keep as <div> (not <script>) so it is NOT removed by the script-stripping loop
      galleryDataEl.removeAttribute("sf-product-gallery-data");
      galleryDataEl.set_content(`{"allImages":[${allImagesLiq}],"variantGalleries":${variantGalleriesLiq}}`);
      console.log(`   📦  Product gallery data JSON → Liquid`);
   }

   // ── Варіанти [sf-product-variants] ───────────────────────────────────────
   // <div sf-product-variants class="product-page__variants"></div>
   const variantsEl = el.querySelector("[sf-product-variants]");
   if (variantsEl) {
      variantsEl.removeAttribute("sf-product-variants");
      const variantsClass =
         variantsEl.getAttribute("class") ?? "product-page__variants";

      const liquidContent = `{%- unless product.has_only_default_variant -%}{%- for option in product.options_with_values -%}<div class="${variantsClass}-group"><label class="${variantsClass}-label">{{ option.name }}</label><div class="${variantsClass}-options">{%- for value in option.values -%}<button type="button" class="${variantsClass}-btn{% if option.selected_value == value %} is-active{% endif %}" data-option-name="{{ option.name | escape }}" data-option-value="{{ value | escape }}">{{ value }}</button>{%- endfor -%}</div></div>{%- endfor -%}{%- endunless -%}`;

      variantsEl.set_content(liquidContent);
      console.log(`   🎨  Product variants → Liquid loop`);
   }

   // ── Variants JSON [sf-product-variants-json] ─────────────────────────────
   // <div id="product-variants-json" sf-product-variants-json hidden>[]</div>
   const variantsJsonEl = el.querySelector("[sf-product-variants-json]");
   if (variantsJsonEl) {
      variantsJsonEl.removeAttribute("sf-product-variants-json");
      variantsJsonEl.set_content(`{{ product.variants | json }}`);
      console.log(`   📊  Product variants JSON → Liquid`);
   }

   // ── Форма [sf-product-form] ───────────────────────────────────────────────
   // <form sf-product-form class="product-page__form">...</form>
   const formEl = el.querySelector("[sf-product-form]");
   if (formEl) {
      formEl.removeAttribute("sf-product-form");
      const formInner = formEl.innerHTML;
      formEl.replaceWith(
         `{%- form 'product', product, class: '${formEl.getAttribute("class") ?? "product-page__form"}' -%}<input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">${formInner}{%- endform -%}`,
      );
      console.log(`   📝  Product form → Liquid form tag`);
   }

   // ── Кнопка [sf-product-btn] ───────────────────────────────────────────────
   // <button sf-product-btn class="btn">Додати в кошик</button>
   const btnEl = el.querySelector("[sf-product-btn]");
   if (btnEl) {
      btnEl.removeAttribute("sf-product-btn");
      const cls = btnEl.getAttribute("class") ?? "btn";
      const btnText = btnEl.innerText?.trim() ?? "Add to cart";
      btnEl.setAttribute("type", "submit");
      btnEl.setAttribute(
         "class",
         `${cls}{% unless product.selected_or_first_available_variant.available %} is-sold-out{% endunless %}`,
      );
      btnEl.set_content(
         `{%- if product.selected_or_first_available_variant.available -%}${btnText}{%- else -%}Sold out{%- endif -%}`,
      );
      console.log(`   🛒  Product button → Liquid`);
   }

   // ── Іконки оплати [sf-product-payment-icons] ─────────────────────────────
   const paymentEl = el.querySelector("[sf-product-payment-icons]");
   if (paymentEl) {
      paymentEl.removeAttribute("sf-product-payment-icons");
      const labelEl = paymentEl.querySelector(".product-detail__payment-label");
      const iconsEl = paymentEl.querySelector(".product-detail__payment-icons");
      if (labelEl) labelEl.set_content(`{{ section.settings.payment_label }}`);
      if (iconsEl) {
         iconsEl.set_content(`{%- for type in shop.enabled_payment_types -%}{{ type | payment_type_svg_tag: class: 'product-detail__payment-icon' }}{%- endfor -%}`);
      }
      // Use set_content (not replaceWith) so sf-product-block attribute stays on the wrapper
      const paymentInner = paymentEl.innerHTML;
      paymentEl.set_content(`{%- if section.settings.show_payment -%}${paymentInner}{%- endif -%}`);
      settings.push({ type: "header", content: "── Product Info ──" });
      settings.push({ type: "checkbox", id: "show_discount", label: "Show discount %", default: true });
      settings.push({ type: "checkbox", id: "show_short_desc", label: "Show short description", default: true });
      settings.push({ type: "checkbox", id: "show_sku", label: "Show SKU", default: true });
      settings.push({ type: "checkbox", id: "show_payment", label: "Show payment icons", default: true });
      settings.push({ type: "text", id: "payment_label", label: "Payment label", default: "We accept:" });
      settings.push({ type: "checkbox", id: "show_delivery", label: "Show delivery info", default: false });
      settings.push({ type: "textarea", id: "delivery_text", label: "Delivery info text", default: "🚚 Free shipping on orders over $50" });
      console.log(`   💳  Payment icons → Liquid`);
   }

   // ── Інфо про доставку [sf-product-delivery] ──────────────────────────────
   const deliveryEl = el.querySelector("[sf-product-delivery]");
   if (deliveryEl) {
      deliveryEl.removeAttribute("sf-product-delivery");
      // Use set_content so sf-product-block attribute stays on the wrapper
      deliveryEl.set_content(`{%- if section.settings.show_delivery -%}{{ section.settings.delivery_text }}{%- endif -%}`);
      console.log(`   🚚  Delivery info → Liquid`);
   }

   // ── Stacked titles [sf-product-tab-title] ────────────────────────────────
   for (const titleEl of el.querySelectorAll("[sf-product-tab-title]")) {
      const tab = titleEl.getAttribute("sf-product-tab-title");
      titleEl.removeAttribute("sf-product-tab-title");
      if (tab === "description") titleEl.set_content(`{{ section.settings.tab_desc_label }}`);
      else if (tab === "specs")    titleEl.set_content(`{{ section.settings.tab_specs_label }}`);
      else if (tab === "shipping") titleEl.set_content(`{{ section.settings.tab_shipping_label }}`);
   }

   // ── Tab buttons [sf-product-tab-btn] ─────────────────────────────────────
   const tabBtns = el.querySelectorAll("[sf-product-tab-btn]");
   for (const btn of tabBtns) {
      const tab = btn.getAttribute("sf-product-tab-btn");
      btn.removeAttribute("sf-product-tab-btn");
      if (tab === "description") btn.set_content(`{{ section.settings.tab_desc_label }}`);
      else if (tab === "specs") {
         btn.set_content(`{{ section.settings.tab_specs_label }}`);
         const btnHtml = btn.toString();
         btn.replaceWith(`{%- if section.settings.show_tab_specs -%}${btnHtml}{%- endif -%}`);
      } else if (tab === "shipping") {
         btn.set_content(`{{ section.settings.tab_shipping_label }}`);
         const btnHtml = btn.toString();
         btn.replaceWith(`{%- if section.settings.show_tab_shipping -%}${btnHtml}{%- endif -%}`);
      }
   }

   // ── Tabs section [sf-product-tab] ─────────────────────────────────────────
   const tabPanels = el.querySelectorAll("[sf-product-tab]");
   if (tabPanels.length) {
      settings.push({ type: "header", content: "── Product Tabs ──" });
      settings.push({ type: "checkbox", id: "show_tabs", label: "Enable tabs (disable = stacked)", default: true });
      settings.push({ type: "text", id: "tab_desc_label",     label: "Tab: Description label",  default: "Description" });
      settings.push({ type: "checkbox", id: "show_tab_specs",    label: "Show Details tab",   default: true });
      settings.push({ type: "text",     id: "tab_specs_label",    label: "Tab: Details label",     default: "Details" });
      settings.push({ type: "checkbox", id: "show_tab_shipping",  label: "Show Shipping tab",  default: true });
      settings.push({ type: "text",     id: "tab_shipping_label", label: "Tab: Shipping label",    default: "Shipping & Returns" });
      settings.push({ type: "textarea", id: "shipping_text",      label: "Shipping tab content",   default: "We offer free standard shipping on all orders. Returns accepted within 30 days." });
      settings.push({ type: "header", content: "── Tabs Style ──" });
      settings.push({ type: "select", id: "tabs_animation", label: "Tab switch animation",
         options: [
            { value: "none",  label: "None"  },
            { value: "fade",  label: "Fade"  },
            { value: "slide", label: "Slide" },
            { value: "scale", label: "Scale" },
            { value: "flip",  label: "Flip"  },
         ], default: "fade" });
      settings.push({ type: "range",    id: "tabs_animation_duration", label: "Animation duration", min: 100, max: 800, step: 50, default: 300, unit: "ms" });
      settings.push({ type: "checkbox", id: "tabs_indicator",  label: "Show indicator line under active tab", default: false });
      settings.push({ type: "checkbox", id: "tabs_scrollable", label: "Scrollable tabs (arrows on mobile)",   default: false });

      // Override data-* attributes on the Tabs root element with Liquid settings
      const tabsRootEl = el.querySelector("[data-tabs]");
      if (tabsRootEl) {
         tabsRootEl.setAttribute("data-animation",          "{{ section.settings.tabs_animation }}");
         tabsRootEl.setAttribute("data-animation-duration", "{{ section.settings.tabs_animation_duration }}");
         tabsRootEl.setAttribute("data-indicator",          "{{ section.settings.tabs_indicator }}");
         tabsRootEl.setAttribute("data-scrollable",         "{{ section.settings.tabs_scrollable }}");
      }

      // Update tab labels dynamically from settings
      for (const panel of tabPanels) {
         const tab = panel.getAttribute("sf-product-tab");
         panel.removeAttribute("sf-product-tab");
         if (tab === "description") {
            panel.setAttribute("data-tab-label", "{{ section.settings.tab_desc_label }}");
         } else if (tab === "specs") {
            panel.setAttribute("data-tab-label", "{{ section.settings.tab_specs_label }}");
            const specsHtml = panel.toString();
            panel.replaceWith(`{%- if section.settings.show_tab_specs -%}${specsHtml}{%- endif -%}`);
         } else if (tab === "shipping") {
            panel.setAttribute("data-tab-label", "{{ section.settings.tab_shipping_label }}");
            const shippingHtml = panel.toString();
            panel.replaceWith(`{%- if section.settings.show_tab_shipping -%}${shippingHtml}{%- endif -%}`);
         }
      }
      // When show_tabs=false: hide nav, show all panels stacked via inline CSS
      const tabsRoot = el.querySelector("[data-tabs]");
      if (tabsRoot) {
         const tabsHtml = el.innerHTML;
         el.set_content(
            `{%- unless section.settings.show_tabs -%}<style>#shopify-section-{{ section.id }} .tabs__nav-wrapper{display:none!important}#shopify-section-{{ section.id }} .tabs__panel{display:block!important;opacity:1!important;height:auto!important;transform:none!important;position:static!important}#shopify-section-{{ section.id }} .product-tabs__stacked-title{display:block!important}</style>{%- endunless -%}${tabsHtml}`
         );
      }
      console.log(`   📑  Product tabs → Liquid`);
   }

   // ── Shipping text [sf-product-shipping-text] ──────────────────────────────
   const shippingTextEl = el.querySelector("[sf-product-shipping-text]");
   if (shippingTextEl) {
      shippingTextEl.removeAttribute("sf-product-shipping-text");
      shippingTextEl.set_content(`{{ section.settings.shipping_text }}`);
   }

   // ── Product blocks (reorderable via Shopify drag-and-drop) ────────────────
   const infoEl = el.querySelector("[sf-product-info]");
   const blockEls: any[] = infoEl ? Array.from(infoEl.querySelectorAll("[sf-product-block]")) : [];

   if (!infoEl || !blockEls.length) return null;

   infoEl.removeAttribute("sf-product-info");

   // Save hidden elements (must stay outside the blocks loop)
   const hiddenEls: any[] = Array.from(infoEl.querySelectorAll("[hidden]"));
   const hiddenHtml = hiddenEls.map((h: any) => h.toString()).join("");
   for (const h of hiddenEls) h.remove();

   const BLOCK_NAMES: Record<string, string> = {
      title: "Title", price: "Price", short_description: "Short Description",
      variants: "Variants", form: "Add to Cart", sku: "SKU",
      payment: "Payment Icons", delivery: "Delivery Info",
   };

   const blocks: any[] = [];
   const presetBlocks: any[] = [];
   const cases: string[] = [];

   let attrIdx = 9000; // unique index to avoid collision with other placeholders
   for (const blockEl of blockEls) {
      const type = blockEl.getAttribute("sf-product-block")!;
      blockEl.removeAttribute("sf-product-block");
      // Add {{ block.shopify_attributes }} — enables drag handles in Shopify theme editor
      blockEl.setAttribute(`__liquid_attr_${attrIdx++}__`, "{{ block.shopify_attributes }}");
      const html = blockEl.toString();
      blocks.push({ type, name: BLOCK_NAMES[type] ?? type, limit: 1, settings: [] });
      presetBlocks.push({ type });
      cases.push(`{%- when '${type}' -%}${html}`);
   }

   const loop = `{%- for block in section.blocks -%}{%- case block.type -%}${cases.join("")}{%- endcase -%}{%- endfor -%}`;
   infoEl.set_content(hiddenHtml + loop);

   console.log(`   🧩  Product blocks: ${blocks.length} (reorderable)`);
   return { blocks, presetBlocks };
}

// ── generateSection ───────────────────────────────────────────────────────────
function generateSection(
   el: any,
   sectionName: string,
): { sectionLiquid: string; schema: string; presetBlocks: any[] } {
   const settings: any[] = [];

   // ❗ Порядок важливий — спочатку компоненти що можуть містити вкладені
   const tabsResult = transformTabs(el, settings);
   const accordionResult = transformAccordion(el, settings);
   const marqueeResult = transformMarquee(el, settings);
   const countersResult = transformCounters(el);
   const galleryResult = transformGallery(el);

   // transformSlider — додає settings, data-* атрибути і трансформує sf-block всередині
   const sliderResult = transformSlider(el, settings);

   // transformSource — замінює sf-source + sf-field на Liquid loop
   const sourceResult = transformSource(el, settings);

   // transformPagination — додає settings і data-* атрибути для JS-пагінації
   transformPagination(el, settings);

   // transformCollectionFilter — filter_position setting + label data-атрибути
   transformCollectionFilter(el, settings);

   // transformProduct — замінює sf-product атрибути на Liquid вирази + генерує blocks
   const productResult = transformProduct(el, settings);

   // Прибираємо залишкові sf-* після трансформацій
   for (const node of el.querySelectorAll(
      "[data-marquee] [sf-id], [data-marquee] [sf-image]",
   )) {
      node.removeAttribute("sf-id");
      node.removeAttribute("sf-image");
      node.removeAttribute("sf-type");
      node.removeAttribute("sf-label");
   }
   for (const node of el.querySelectorAll(
      "[data-tabs] [sf-id], [data-tabs] [sf-image]",
   )) {
      node.removeAttribute("sf-id");
      node.removeAttribute("sf-image");
      node.removeAttribute("sf-type");
      node.removeAttribute("sf-label");
   }

   for (const script of el.querySelectorAll("script")) script.remove();

   for (const node of el.querySelectorAll("[sf-image]")) {
      const id = node.getAttribute("sf-image")!;
      const cls = node.getAttribute("class") ?? "image-wrapper";
      const style = node.getAttribute("style") ?? "";
      const hasAspectRatio = style.includes("--aspect-ratio");
      const origImg = node.querySelector("img");
      const defaultAlt = origImg?.getAttribute("alt") ?? "";

      settings.push({
         type: "checkbox",
         id: `show_${id}`,
         label: `Show ${formatLabel(id)}`,
         default: true,
      });
      settings.push({ type: "image_picker", id, label: formatLabel(id) });
      settings.push({
         type: "text",
         id: `${id}_alt`,
         label: `${formatLabel(id)} Alt`,
         default: defaultAlt,
      });

      const styleAttr = hasAspectRatio ? ` style="${style}"` : "";
      const liquidSrcset = `{{ section.settings.${id} | image_url: width: 400, format: 'webp' }} 400w, {{ section.settings.${id} | image_url: width: 800, format: 'webp' }} 800w, {{ section.settings.${id} | image_url: width: 1200, format: 'webp' }} 1200w`;
      const origSrc = origImg?.getAttribute("src") ?? "";
      const defaultFileName = origSrc.split("/").pop()?.split("?")[0] ?? "";
      const defaultImgHtml = defaultFileName
         ? `<div class="${cls}"${styleAttr}><img src="{{ '${defaultFileName}' | asset_url }}" alt="{{ section.settings.${id}_alt }}" class="img" loading="lazy"></div>`
         : "";

      node.replaceWith(
         `{% if section.settings.show_${id} %}{% if section.settings.${id} %}<div class="${cls}"${styleAttr}><img src="{{ section.settings.${id} | image_url: width: 1200, format: 'webp' }}" srcset="${liquidSrcset}" sizes="(max-width: 768px) 100vw, 800px" alt="{{ section.settings.${id}_alt }}" class="img" loading="lazy" width="{{ section.settings.${id}.width }}" height="{{ section.settings.${id}.height }}"></div>{% else %}${defaultImgHtml}{% endif %}{% endif %}`,
      );
   }

   for (const node of el.querySelectorAll("[sf-logo]")) {
      const id = node.getAttribute("sf-logo")!;
      const cls = node.getAttribute("class") ?? "logo";
      const defaultText = node.innerText.trim() || "My Logo";
      settings.push({
         type: "image_picker",
         id: `${id}_image`,
         label: `${formatLabel(id)} Image`,
      });
      settings.push({
         type: "text",
         id: `${id}_alt`,
         label: `${formatLabel(id)} Alt`,
         default: "Logo",
      });
      settings.push({
         type: "text",
         id: `${id}_text`,
         label: `${formatLabel(id)} Text`,
         default: defaultText,
      });
      node.replaceWith(
         `{% if section.settings.${id}_image %}{% if request.page_type == 'index' %}<div class="${cls}"><img src="{{ section.settings.${id}_image | image_url: width: 300 }}" alt="{{ section.settings.${id}_alt }}" class="logo__image"></div>{% else %}<a href="/" class="${cls}"><img src="{{ section.settings.${id}_image | image_url: width: 300 }}" alt="{{ section.settings.${id}_alt }}" class="logo__image"></a>{% endif %}{% else %}{% if request.page_type == 'index' %}<div class="${cls}"><span class="logo__text">{{ section.settings.${id}_text }}</span></div>{% else %}<a href="/" class="${cls}"><span class="logo__text">{{ section.settings.${id}_text }}</span></a>{% endif %}{% endif %}`,
      );
   }

   for (const node of el.querySelectorAll("[sf-id]")) {
      const id = node.getAttribute("sf-id")!;
      const type = node.getAttribute("sf-type") ?? inferType(node.tagName);
      const label = node.getAttribute("sf-label") ?? formatLabel(id);
      settings.push({
         type,
         id,
         label,
         default:
            type === "richtext"
               ? `<p>${node.innerText.trim()}</p>`
               : node.innerText.trim(),
      });

      const sfUrl = node.getAttribute("sf-url");
      if (sfUrl) {
         settings.push({ type: "url", id: sfUrl, label: formatLabel(sfUrl) });
         node.setAttribute("href", `{{ section.settings.${sfUrl} }}`);
         node.removeAttribute("sf-url");
      }

      if (type === "image_picker") {
         node.set_content(
            `<img src="{{ section.settings.${id} | image_url: width: 1200 }}" alt="{{ section.settings.${id}.alt }}" loading="lazy">`,
         );
         node.removeAttribute("sf-id");
         node.removeAttribute("sf-type");
         node.removeAttribute("sf-label");
      } else {
         node.set_content(`{{ section.settings.${id} }}`);
         node.removeAttribute("sf-id");
         node.removeAttribute("sf-type");
         node.removeAttribute("sf-label");
         node.replaceWith(
            `{% if section.settings.${id} != blank %}${node.outerHTML}{% endif %}`,
         );
      }
   }

   // ── Збираємо всі blocks ───────────────────────────────────────────────────
   const allBlocks: any[] = [];
   const presetBlocksData: any[] = [];

   if (galleryResult) {
      allBlocks.push(...galleryResult.blocks);
      presetBlocksData.push(...galleryResult.presetBlocks);
   }
   if (accordionResult) {
      allBlocks.push(...accordionResult.blocks);
      presetBlocksData.push(...accordionResult.presetBlocks);
   }
   if (marqueeResult) {
      allBlocks.push(...marqueeResult.blocks);
      presetBlocksData.push(...marqueeResult.presetBlocks);
   }
   if (countersResult) {
      allBlocks.push(...countersResult.blocks);
      presetBlocksData.push(...countersResult.presetBlocks);
   }
   if (tabsResult) {
      allBlocks.push(...tabsResult.blocks);
      presetBlocksData.push(...tabsResult.presetBlocks);
   }
   // ── Слайдер — додаємо blocks якщо є sf-block всередині ───────────────────
   if (sliderResult) {
      allBlocks.push(...sliderResult.blocks);
      presetBlocksData.push(...sliderResult.presetBlocks);
   }
   // sourceResult — для featured_products повертає block schema (product picker)
   if (sourceResult && sourceResult.blocks.length) {
      allBlocks.push(...sourceResult.blocks);
      presetBlocksData.push(...sourceResult.presetBlocks);
   }
   if (productResult) {
      allBlocks.push(...productResult.blocks);
      presetBlocksData.push(...productResult.presetBlocks);
   }

   const schemaLabel = formatLabel(sectionName).slice(0, 25);
   const schemaObj: any = {
      name: schemaLabel,
      settings,
      presets: [
         {
            name: schemaLabel,
            ...(presetBlocksData.length > 0 && { blocks: presetBlocksData }),
         },
      ],
   };

   if (allBlocks.length > 0) {
      schemaObj.blocks = allBlocks;
      schemaObj.max_blocks = 50;
   }

   const schemaJson = JSON.stringify(schemaObj, null, 2);
   const schemaBlock = `\n{% schema %}\n${schemaJson}\n{% endschema %}\n`;

   // ── Post-process: замінюємо __liquid_attr_*__ placeholders ───────────────
   let sectionLiquid = el.outerHTML + schemaBlock;
   sectionLiquid = sectionLiquid.replace(
      /__liquid_attr_\d+__="([^"]+)"/g,
      (_, val) => val,
   );

   return { sectionLiquid, schema: schemaJson, presetBlocks: presetBlocksData };
}

function generateTemplateJson(
   sectionNames: string[],
   sectionPresets?: Record<string, any[]>,
): string {
   const sections: Record<string, any> = {};
   for (const name of sectionNames) {
      const presets = sectionPresets?.[name];
      if (presets?.length) {
         const blocks: Record<string, any> = {};
         const block_order: string[] = [];
         presets.forEach((b, i) => {
            const key = `${b.type}_${i + 1}`;
            blocks[key] = { type: b.type, settings: {} };
            block_order.push(key);
         });
         sections[name] = { type: name, settings: {}, blocks, block_order };
      } else {
         sections[name] = { type: name, settings: {} };
      }
   }
   return JSON.stringify({ sections, order: sectionNames }, null, 2);
}

function generateConfig(themeDir: string) {
   const settingsSchema = [
      {
         name: "theme_info",
         theme_name: "Astro Theme",
         theme_version: "1.0.0",
         theme_author: "Custom",
         theme_documentation_url: "https://shopify.dev",
         theme_support_url: "https://shopify.dev",
      },
   ];
   writeFileSync(
      join(themeDir, "config", "settings_schema.json"),
      JSON.stringify(settingsSchema, null, 2),
   );
   writeFileSync(
      join(themeDir, "config", "settings_data.json"),
      JSON.stringify({ current: "Default", presets: { Default: {} } }, null, 2),
   );
   writeFileSync(
      join(themeDir, "locales", "en.default.json"),
      JSON.stringify({ general: { title: "General" } }, null, 2),
   );

   // ── page.json ─────────────────────────────────────────────────────────────
   writeFileSync(
      join(themeDir, "templates", "page.json"),
      JSON.stringify(
         {
            sections: { main: { type: "page-default", settings: {} } },
            order: ["main"],
         },
         null,
         2,
      ),
   );
   writeFileSync(
      join(themeDir, "sections", "page-default.liquid"),
      `{{ page.content }}\n{% schema %}\n{"name": "Page", "settings": []}\n{% endschema %}\n`,
   );

   // ── product.json ──────────────────────────────────────────────────────────
   // Тільки якщо ще не згенерований з HTML (product.astro має sf-section → вже записаний)
   if (!existsSync(join(themeDir, "templates", "product.json"))) {
      const hasTabsSection = existsSync(join(themeDir, "sections", "product-tabs.liquid"));
      const sections: Record<string, any> = { main: { type: "product-template", settings: {} } };
      const order = ["main"];
      if (hasTabsSection) { sections["tabs"] = { type: "product-tabs", settings: {} }; order.push("tabs"); }
      writeFileSync(join(themeDir, "templates", "product.json"), JSON.stringify({ sections, order }, null, 2));
   }
   // product-template.liquid — тільки якщо ще не згенерований з ProductTemplate.astro
   if (!existsSync(join(themeDir, "sections", "product-template.liquid"))) {
      writeFileSync(
         join(themeDir, "sections", "product-template.liquid"),
         `<div class="product-page">
  <div class="product-page__inner">
    <div class="product-page__gallery">
      {%- if product.images.size > 0 -%}
        <div class="product-page__main-image">
          <img
            src="{{ product.featured_image | image_url: width: 1200, format: 'webp' }}"
            alt="{{ product.featured_image.alt | default: product.title }}"
            width="{{ product.featured_image.width }}"
            height="{{ product.featured_image.height }}"
            loading="eager"
            class="img"
          >
        </div>
        {%- if product.images.size > 1 -%}
          <div class="product-page__thumbs">
            {%- for image in product.images -%}
              <div class="product-page__thumb">
                <img
                  src="{{ image | image_url: width: 200, format: 'webp' }}"
                  alt="{{ image.alt | default: product.title }}"
                  loading="lazy"
                  class="img"
                >
              </div>
            {%- endfor -%}
          </div>
        {%- endif -%}
      {%- endif -%}
    </div>

    <div class="product-page__info">
      <h1 class="product-page__title">{{ product.title }}</h1>

      {%- if product.vendor != blank -%}
        <p class="product-page__vendor">{{ product.vendor }}</p>
      {%- endif -%}

      {%- assign _sv = product.selected_or_first_available_variant -%}
      <div class="product-page__price">
        <span class="product-page__price-old product-detail__price-old"{% unless _sv.compare_at_price > _sv.price %} style="display:none"{% endunless %}>
          {{- _sv.compare_at_price | money -}}
        </span>
        <span class="product-page__price-current product-detail__price" data-money-format="{{ shop.money_format }}">
          {{- _sv.price | money -}}
        </span>
      </div>

      {%- if product.description != blank -%}
        <div class="product-page__description">{{ product.description }}</div>
      {%- endif -%}

      {%- form 'product', product -%}
        {%- unless product.has_only_default_variant -%}
          {%- for option in product.options_with_values -%}
            <div class="product-page__option">
              <label class="product-page__option-label">{{ option.name }}</label>
              <select name="options[{{ option.name | escape }}]" class="product-page__option-select">
                {%- for value in option.values -%}
                  <option value="{{ value | escape }}" {% if option.selected_value == value %}selected{% endif %}>
                    {{ value }}
                  </option>
                {%- endfor -%}
              </select>
            </div>
          {%- endfor -%}
        {%- endunless -%}

        <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">

        <button
          type="submit"
          class="product-page__btn btn"
          {% unless product.selected_or_first_available_variant.available %}disabled{% endunless %}
        >
          {%- if product.selected_or_first_available_variant.available -%}
            {{ 'products.product.add_to_cart' | t | default: 'Add to cart' }}
          {%- else -%}
            {{ 'products.product.sold_out' | t | default: 'Sold out' }}
          {%- endif -%}
        </button>
      {%- endform -%}
    </div>
  </div>
</div>

{% schema %}
{"name": "Product", "settings": []}
{% endschema %}
`,
      );
      console.log("✅ sections/product-template.liquid (дефолт)");
   } else {
      console.log(
         "✅ sections/product-template.liquid (з ProductTemplate.astro)",
      );
   }

   // ── collection.json ───────────────────────────────────────────────────────
   writeFileSync(
      join(themeDir, "templates", "collection.json"),
      JSON.stringify(
         {
            sections: { main: { type: "collection-template", settings: {} } },
            order: ["main"],
         },
         null,
         2,
      ),
   );
   // collection-template.liquid — тільки якщо ще не згенерований
   if (!existsSync(join(themeDir, "sections", "collection-template.liquid"))) {
      writeFileSync(
         join(themeDir, "sections", "collection-template.liquid"),
         `<div class="collection-page">
  <div class="collection-page__header">
    {%- if collection.image -%}
      <div class="collection-page__banner">
        <img
          src="{{ collection.image | image_url: width: 1600, format: 'webp' }}"
          alt="{{ collection.image.alt | default: collection.title }}"
          loading="eager"
          class="img"
        >
      </div>
    {%- endif -%}
    <h1 class="collection-page__title">{{ collection.title }}</h1>
    {%- if collection.description != blank -%}
      <div class="collection-page__description">{{ collection.description }}</div>
    {%- endif -%}
  </div>

  <div class="collection-page__grid">
    {%- for product in collection.products -%}
      <a href="{{ product.url }}" class="product-card">
        <div class="product-card__image image-wrapper">
          <img
            src="{{ product.featured_image | image_url: width: 600, format: 'webp' }}"
            alt="{{ product.featured_image.alt | default: product.title }}"
            loading="lazy"
            class="img"
          >
        </div>
        <div class="product-card__info">
          <h3 class="product-card__title">{{ product.title }}</h3>
          {%- assign _pv = product.selected_or_first_available_variant -%}
          <div class="product-card__price">
            {%- if _pv.compare_at_price > _pv.price -%}
              <span class="product-card__price-old">{{ _pv.compare_at_price | money }}</span>
            {%- endif -%}
            <span class="product-card__price-current">{{ _pv.price | money }}</span>
          </div>
        </div>
      </a>
    {%- endfor -%}
  </div>

  {%- if paginate.pages > 1 -%}
    <div class="collection-page__pagination">
      {{ paginate | default_pagination }}
    </div>
  {%- endif -%}
</div>

{% schema %}
{"name": "Collection", "settings": []}
{% endschema %}
`,
      );
      console.log("✅ sections/collection-template.liquid (дефолт)");
   } else {
      console.log(
         "✅ sections/collection-template.liquid (з CollectionTemplate.astro)",
      );
   }

   console.log("✅ config/, locales/ та page.json створено");
   console.log("✅ product.json та collection.json створено");
}

function copyAssets(outDir: string, assetsDir: string) {
   const assetExtensions = [
      ".css",
      ".js",
      ".svg",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".woff",
      ".woff2",
   ];
   function copyDir(src: string) {
      if (!existsSync(src)) return;
      for (const entry of readdirSync(src, { withFileTypes: true })) {
         const full = join(src, entry.name);
         if (entry.isDirectory() && entry.name !== "_theme") {
            copyDir(full);
         } else if (
            entry.isFile() &&
            assetExtensions.includes(extname(entry.name))
         ) {
            if (extname(entry.name) === ".css") {
               let css = readFileSync(full, "utf-8");
               css = css.replace(/\[data-astro-cid-[a-z0-9]+\]/g, "");
               writeFileSync(join(assetsDir, entry.name), css);
            } else if (extname(entry.name) === ".js") {
               let js = readFileSync(full, "utf-8");
               // Vite generates assetsURL that prepends "/" — in Shopify assets live on CDN
               // so relative paths must resolve from import.meta.url, not the store domain
               js = js.replace(
                  /const assetsURL\s*=\s*function\(dep\)\s*\{\s*return\s*["'\/].*?["']?\s*\+\s*dep\s*\}/g,
                  "const assetsURL = function(dep) { return new URL(dep, import.meta.url).href }",
               );
               writeFileSync(join(assetsDir, entry.name), js);
            } else {
               copyFileSync(full, join(assetsDir, entry.name));
            }
         }
      }
   }
   copyDir(outDir);
   console.log("✅ assets/ скопійовано");
}

function findHtmlFiles(
   dir: string,
   rootDir: string,
): {
   file: string;
   sectionName: string;
   templateName: string;
   sfTemplate?: string;
}[] {
   const files: {
      file: string;
      sectionName: string;
      templateName: string;
      sfTemplate?: string;
   }[] = [];
   for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "_theme") {
         files.push(...findHtmlFiles(full, rootDir));
      } else if (entry.name.endsWith(".html")) {
         const relative = full.replace(rootDir, "").replace(/^\//, "");
         let sectionName: string;
         let templateName: string;
         if (relative === "index.html") {
            sectionName = "home";
            templateName = "index";
         } else {
            const slug = relative
               .replace("/index.html", "")
               .replace(".html", "")
               .replace(/\//g, "-");
            sectionName = slug;
            templateName = `page.${slug}`;
         }

         // Читаємо sf-template з HTML якщо є
         let sfTemplate: string | undefined;
         try {
            const html = readFileSync(full, "utf-8");
            const root = parse(html);
            const templateEl = root.querySelector("[sf-template]");
            if (templateEl) {
               sfTemplate = templateEl.getAttribute("sf-template") ?? undefined;
               // Якщо sf-template вказано — templateName = саме це значення
               if (sfTemplate) {
                  templateName = sfTemplate;
                  sectionName = `${sfTemplate}-template`;
               }
            }
         } catch {}

         files.push({ file: full, sectionName, templateName, sfTemplate });
      }
   }
   return files;
}

function inferType(tagName: string): string {
   const map: Record<string, string> = {
      H1: "text",
      H2: "text",
      H3: "text",
      H4: "text",
      H5: "text",
      H6: "text",
      P: "richtext",
      DIV: "richtext",
      SPAN: "text",
      IMG: "image_picker",
      VIDEO: "video",
      A: "text",
   };
   return map[tagName.toUpperCase()] ?? "text";
}

function formatLabel(id: string): string {
   return id
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
}
