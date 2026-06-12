<?php

/**
 * Сторінка налаштувань "Footer Settings" (стандартний WP Settings API, без плагінів).
 * Зберігається в одному option-масиві "rachwalski_footer_settings".
 */

function rachwalski_footer_settings_defaults() {
   return [
      'show_newsletter' => 1,
      'show_socials'    => 1,
      'show_book_btn'   => 1,
      'default_bg'      => '',
   ];
}

function rachwalski_get_footer_setting($key) {
   $settings = wp_parse_args(
      get_option('rachwalski_footer_settings', []),
      rachwalski_footer_settings_defaults()
   );

   return $settings[$key] ?? null;
}

function rachwalski_footer_settings_menu() {
   add_options_page(
      'Footer Settings',
      'Footer Settings',
      'manage_options',
      'rachwalski-footer-settings',
      'rachwalski_footer_settings_page'
   );
}
add_action('admin_menu', 'rachwalski_footer_settings_menu');

function rachwalski_footer_settings_register() {
   register_setting('rachwalski_footer_settings_group', 'rachwalski_footer_settings', [
      'sanitize_callback' => 'rachwalski_sanitize_footer_settings',
   ]);
}
add_action('admin_init', 'rachwalski_footer_settings_register');

function rachwalski_sanitize_footer_settings($input) {
   return [
      'show_newsletter' => empty($input['show_newsletter']) ? 0 : 1,
      'show_socials'    => empty($input['show_socials']) ? 0 : 1,
      'show_book_btn'   => empty($input['show_book_btn']) ? 0 : 1,
      'default_bg'      => isset($input['default_bg']) ? sanitize_text_field($input['default_bg']) : '',
      'default_bg_id'   => isset($input['default_bg_id']) ? absint($input['default_bg_id']) : 0,
   ];
}

function rachwalski_footer_settings_page() {
   $settings = wp_parse_args(
      get_option('rachwalski_footer_settings', []),
      rachwalski_footer_settings_defaults()
   );
   ?>
   <div class="wrap">
      <h1>Footer Settings</h1>
      <form method="post" action="options.php">
         <?php settings_fields('rachwalski_footer_settings_group'); ?>
         <table class="form-table">
            <tr>
               <th scope="row">Newsletter block</th>
               <td>
                  <label>
                     <input type="checkbox" name="rachwalski_footer_settings[show_newsletter]" value="1" <?php checked($settings['show_newsletter'], 1); ?>>
                     Show "Stay Connected" newsletter block
                  </label>
               </td>
            </tr>
            <tr>
               <th scope="row">Social links</th>
               <td>
                  <label>
                     <input type="checkbox" name="rachwalski_footer_settings[show_socials]" value="1" <?php checked($settings['show_socials'], 1); ?>>
                     Show social links block
                  </label>
                  <p class="description">
                     Керування списком соц. мереж — у меню "Social Links" зліва.
                  </p>
               </td>
            </tr>
            <tr>
               <th scope="row">Book consultation button</th>
               <td>
                  <label>
                     <input type="checkbox" name="rachwalski_footer_settings[show_book_btn]" value="1" <?php checked($settings['show_book_btn'], 1); ?>>
                     Show "Book consultation" button
                  </label>
               </td>
            </tr>
            <tr>
               <th scope="row">Default footer background</th>
               <td>
                  <div id="rachwalski-footer-bg-preview" style="margin-bottom:10px;">
                     <?php if (!empty($settings['default_bg'])): ?>
                        <img src="<?php echo esc_url($settings['default_bg']); ?>" style="max-width:300px; height:auto; display:block;">
                     <?php endif; ?>
                  </div>
                  <input type="hidden" name="rachwalski_footer_settings[default_bg]" id="rachwalski-footer-bg-url" value="<?php echo esc_attr($settings['default_bg']); ?>">
                  <input type="hidden" name="rachwalski_footer_settings[default_bg_id]" id="rachwalski-footer-bg-id" value="<?php echo esc_attr($settings['default_bg_id'] ?? ''); ?>">
                  <button type="button" class="button" id="rachwalski-footer-bg-select">Select image</button>
                  <button type="button" class="button" id="rachwalski-footer-bg-remove" <?php echo empty($settings['default_bg']) ? 'style="display:none;"' : ''; ?>>Remove</button>
                  <p class="description">
                     Використовується на сторінках, де не задано власне фонове зображення футера.
                  </p>
               </td>
            </tr>
         </table>
         <?php submit_button(); ?>
      </form>
   </div>
   <script>
   jQuery(function ($) {
      var frame;
      $('#rachwalski-footer-bg-select').on('click', function (e) {
         e.preventDefault();
         if (frame) { frame.open(); return; }
         frame = wp.media({
            title: 'Select footer background image',
            button: { text: 'Use this image' },
            multiple: false,
         });
         frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            $('#rachwalski-footer-bg-url').val(attachment.url);
            $('#rachwalski-footer-bg-id').val(attachment.id);
            $('#rachwalski-footer-bg-preview').html('<img src="' + attachment.url + '" style="max-width:300px; height:auto; display:block;">');
            $('#rachwalski-footer-bg-remove').show();
         });
         frame.open();
      });
      $('#rachwalski-footer-bg-remove').on('click', function (e) {
         e.preventDefault();
         $('#rachwalski-footer-bg-url').val('');
         $('#rachwalski-footer-bg-id').val('');
         $('#rachwalski-footer-bg-preview').html('');
         $(this).hide();
      });
   });
   </script>
   <?php
}

function rachwalski_footer_settings_enqueue_media($hook) {
   if ($hook === 'settings_page_rachwalski-footer-settings') {
      wp_enqueue_media();
   }
}
add_action('admin_enqueue_scripts', 'rachwalski_footer_settings_enqueue_media');
