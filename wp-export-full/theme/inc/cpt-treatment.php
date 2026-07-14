<?php

/**
 * CPT "Treatment" — сторінки послуг (rhinoplasty і т.д.), один шаблон
 * single-treatment.php для всіх. URL навмисно ПЛАСКИЙ (rewrite slug: '') —
 * без /treatment/ префіксу, щоб /rhinoplasty лишився без редиректу.
 *
 * Мега-меню навмисно НЕ автогенерується з таксономії treatment_category —
 * структура групування в навігації ще не стабільна (див. project_wp_launch_plan
 * пам'ять). Категорія тут — лише для внутрішньої фільтрації/related, пункти
 * меню додаються вручну через Appearance → Menus.
 */
function rachwalski_register_treatment_cpt() {
   register_post_type('treatment', [
      'labels' => [
         'name'          => 'Treatments',
         'singular_name' => 'Treatment',
         'add_new_item'  => 'Add Treatment',
         'edit_item'     => 'Edit Treatment',
         'all_items'     => 'All Treatments',
      ],
      'public'       => true,
      'show_ui'      => true,
      'show_in_menu' => true,
      'show_in_rest' => true, // Gutenberg-редактор + ACF Blocks у content
      'menu_icon'    => 'dashicons-heart',
      'supports'     => ['title', 'editor', 'thumbnail', 'excerpt'],
      'has_archive'  => false, // немає /treatments/-архіву в URL, кожна сторінка окремо
      'rewrite'      => [
         // '' тут НЕ працює — register_post_type() трактує порожній рядок як
         // "не задано" (empty() у ядрі WP) і підставляє замість нього назву
         // CPT. '/' — непорожній рядок, тому фолбек не спрацьовує, а сегмент
         // залишається порожнім: /rhinoplasty, не /treatment/rhinoplasty.
         'slug'       => '/',
         'with_front' => false,
      ],
   ]);
}
add_action('init', 'rachwalski_register_treatment_cpt');

/**
 * Плаский URL (rewrite slug: '/') резолвиться WP у query var "name" БЕЗ
 * post_type — а WP_Query за замовчуванням шукає "name" лише серед звичайних
 * post, тому CPT-записи так ніколи не знаходились (перевірено: пряме 404).
 * Тут — якщо реально існує Treatment з таким slug, підставляємо post_type
 * явно. Активується ТІЛЬКИ коли такий запис справді є, тож на звичайні
 * сторінки/пости жодного впливу.
 */
function rachwalski_treatment_flat_url_request($query_vars) {
   if (empty($query_vars['name']) || !empty($query_vars['post_type']) || !empty($query_vars['pagename'])) {
      return $query_vars;
   }

   $treatment = get_page_by_path($query_vars['name'], OBJECT, 'treatment');
   if ($treatment) {
      $query_vars['post_type'] = 'treatment';
   }

   return $query_vars;
}
add_filter('request', 'rachwalski_treatment_flat_url_request');

/**
 * Таксономія категорій — ієрархічна (як стандартні WP-категорії), для
 * внутрішньої організації/фільтрації/related, НЕ для мега-меню.
 */
function rachwalski_register_treatment_category_taxonomy() {
   register_taxonomy('treatment_category', 'treatment', [
      'labels' => [
         'name'          => 'Treatment Categories',
         'singular_name' => 'Treatment Category',
      ],
      'hierarchical'      => true,
      'public'            => true,
      'show_ui'           => true,
      'show_in_rest'      => true,
      'show_admin_column' => true,
      'rewrite'           => false, // не потрібні власні архівні URL категорій
   ]);
}
add_action('init', 'rachwalski_register_treatment_category_taxonomy');
