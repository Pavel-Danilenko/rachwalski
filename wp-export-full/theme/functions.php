<?php

/**
 * Підключення стилів та скриптів теми.
 */
function rachwalski_assets() {
   $theme_version = wp_get_theme()->get('Version');

   // Google Fonts — DM Sans
   wp_enqueue_style(
      'rachwalski-fonts',
      'https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600;700&display=swap&subset=latin,cyrillic',
      [],
      null
   );

   // Глобальні стилі (reset, типографіка, компоненти) — на всіх сторінках
   wp_enqueue_style(
      'rachwalski-global',
      get_template_directory_uri() . '/assets/css/global.css',
      [],
      $theme_version
   );

   // Стилі футера — на всіх сторінках
   wp_enqueue_style(
      'rachwalski-footer',
      get_template_directory_uri() . '/assets/css/footer.css',
      ['rachwalski-global'],
      $theme_version
   );

   // Виправляє viewBox іконок зі спрайту під час рантайму
   wp_enqueue_script(
      'rachwalski-icons',
      get_template_directory_uri() . '/assets/js/icons.js',
      [],
      $theme_version,
      true
   );
}
add_action('wp_enqueue_scripts', 'rachwalski_assets');

require_once get_theme_file_path('inc/acf-fields.php');
require_once get_theme_file_path('inc/cpt-social-links.php');
require_once get_theme_file_path('inc/footer-settings.php');

/**
 * Виводить іконку зі спрайту (template-parts/icon-sprite.svg).
 */
function rachwalski_icon($name, $class = 'icon') {
   printf(
      '<svg class="%s" data-icon="%s" aria-hidden="true" focusable="false"><use href="#icon-%s"></use></svg>',
      esc_attr($class),
      esc_attr($name),
      esc_attr($name)
   );
}

/**
 * Людська підпис для соц. мережі — для aria-label.
 */
function rachwalski_social_label($platform) {
   $labels = [
      'instagram' => 'Instagram',
      'linkedin'  => 'LinkedIn',
      'facebook'  => 'Facebook',
      'twitter'   => 'X',
      'youtube'   => 'YouTube',
      'tiktok'    => 'TikTok',
      'pinterest' => 'Pinterest',
   ];
   return $labels[$platform] ?? 'Social link';
}
