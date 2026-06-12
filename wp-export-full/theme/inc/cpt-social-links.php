<?php

/**
 * CPT "Social Link" — список соц. мереж у футері.
 * Заголовок запису = внутрішня назва (не показується на сайті).
 * Порядок — поле "Order" (page-attributes), менше число = вище в списку.
 */
function rachwalski_register_social_link_cpt() {
   register_post_type('social_link', [
      'labels' => [
         'name'          => 'Social Links',
         'singular_name' => 'Social Link',
         'add_new_item'  => 'Add Social Link',
         'edit_item'     => 'Edit Social Link',
      ],
      'public'        => false,
      'show_ui'       => true,
      'show_in_menu'  => true,
      'menu_icon'     => 'dashicons-share',
      'supports'      => ['title', 'page-attributes'],
      'menu_position' => 59,
   ]);
}
add_action('init', 'rachwalski_register_social_link_cpt');

/**
 * Повертає масив активних соц. мереж, відсортованих за menu_order.
 * Кожен елемент: platform, url, label, icon.
 */
function rachwalski_get_social_links() {
   $posts = get_posts([
      'post_type'      => 'social_link',
      'post_status'    => 'publish',
      'posts_per_page' => -1,
      'orderby'        => 'menu_order',
      'order'          => 'ASC',
   ]);

   $links = [];
   foreach ($posts as $post) {
      $links[] = [
         'platform' => get_field('platform', $post->ID) ?: 'instagram',
         'url'      => get_field('url', $post->ID) ?: '#',
         'label'    => get_field('label', $post->ID),
         'icon'     => get_field('icon', $post->ID),
      ];
   }

   return $links;
}
