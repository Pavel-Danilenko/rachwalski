<?php

/**
 * ACF (безкоштовна версія): поле фонового зображення футера для кожної сторінки.
 */

if (function_exists('acf_add_local_field_group')) {
   acf_add_local_field_group([
      'key'    => 'group_footer_page_background',
      'title'  => 'Footer background',
      'fields' => [
         [
            'key'           => 'field_page_footer_bg',
            'label'         => 'Footer background image',
            'name'          => 'footer_background_image',
            'type'          => 'image',
            'instructions'  => 'Якщо порожньо — використовується дефолтне зображення з Footer Settings.',
            'return_format' => 'url',
         ],
      ],
      'location' => [
         [
            [
               'param'    => 'post_type',
               'operator' => '==',
               'value'    => 'page',
            ],
         ],
      ],
      'position' => 'side',
   ]);

   // ── Поля для CPT "Social Link" ────────────────────────────────────────────
   acf_add_local_field_group([
      'key'    => 'group_social_link_fields',
      'title'  => 'Social link',
      'fields' => [
         [
            'key'           => 'field_social_platform',
            'label'         => 'Platform',
            'name'          => 'platform',
            'type'          => 'select',
            'choices'       => [
               'instagram' => 'Instagram',
               'linkedin'  => 'LinkedIn',
               'facebook'  => 'Facebook',
               'twitter'   => 'X (Twitter)',
               'youtube'   => 'YouTube',
               'tiktok'    => 'TikTok',
               'pinterest' => 'Pinterest',
               'custom'    => 'Custom (own icon)',
            ],
            'default_value' => 'instagram',
            'allow_null'    => 0,
            'ui'            => 1,
         ],
         [
            'key'   => 'field_social_url',
            'label' => 'URL',
            'name'  => 'url',
            'type'  => 'url',
         ],
         [
            'key'               => 'field_social_label',
            'label'             => 'Label (for accessibility)',
            'name'              => 'label',
            'type'              => 'text',
            'instructions'      => 'Напр. "TikTok" — використовується для aria-label.',
            'conditional_logic' => [
               [
                  [
                     'field'    => 'field_social_platform',
                     'operator' => '==',
                     'value'    => 'custom',
                  ],
               ],
            ],
         ],
         [
            'key'               => 'field_social_icon',
            'label'             => 'Custom icon (SVG)',
            'name'              => 'icon',
            'type'              => 'image',
            'return_format'     => 'url',
            'mime_types'        => 'svg',
            'conditional_logic' => [
               [
                  [
                     'field'    => 'field_social_platform',
                     'operator' => '==',
                     'value'    => 'custom',
                  ],
               ],
            ],
         ],
      ],
      'location' => [
         [
            [
               'param'    => 'post_type',
               'operator' => '==',
               'value'    => 'social_link',
            ],
         ],
      ],
   ]);
}
