<?php
/**
 * WordPress Mail Settings Page
 *
 * Підключення в functions.php теми:
 *   require_once get_template_directory() . '/api/mail-settings.wp.php';
 *
 * Після підключення в WP Адмінці з'явиться:
 *   Параметри → Mail Settings
 */

if (!defined('ABSPATH')) exit;

// ─── Реєстрація сторінки налаштувань ──────────────────────────────────────────
add_action('admin_menu', function () {
    add_options_page(
        'Mail Settings',
        'Mail Settings',
        'manage_options',
        'rw-mail-settings',
        'rw_render_mail_settings_page'
    );
});

// ─── Реєстрація полів ─────────────────────────────────────────────────────────
add_action('admin_init', function () {
    $fields = [
        // SMTP
        'rw_smtp_host'        => ['label' => 'SMTP Host',     'type' => 'text',     'default' => 'localhost'],
        'rw_smtp_port'        => ['label' => 'SMTP Port',     'type' => 'number',   'default' => '587'],
        'rw_smtp_user'        => ['label' => 'SMTP User',     'type' => 'email',    'default' => ''],
        'rw_smtp_pass'        => ['label' => 'SMTP Password', 'type' => 'password', 'default' => ''],

        // Відправник
        'rw_from_email'       => ['label' => 'From Email',    'type' => 'email',    'default' => ''],
        'rw_from_name'        => ['label' => 'From Name',     'type' => 'text',     'default' => ''],

        // Отримувачі форм
        'rw_email_book'       => ['label' => 'Email — Book Consultation', 'type' => 'email', 'default' => ''],
        'rw_email_contact'    => ['label' => 'Email — Contact / Footer',  'type' => 'email', 'default' => ''],
        'rw_email_newsletter' => ['label' => 'Email — Newsletter',        'type' => 'email', 'default' => ''],

        // Fallback
        'rw_recipient_email'  => ['label' => 'Fallback Recipient Email', 'type' => 'email', 'default' => ''],
        'rw_recipient_name'   => ['label' => 'Fallback Recipient Name',  'type' => 'text',  'default' => 'Admin'],
    ];

    foreach ($fields as $key => $field) {
        register_setting('rw_mail_settings', $key, [
            'sanitize_callback' => $field['type'] === 'email'
                ? 'sanitize_email'
                : 'sanitize_text_field',
        ]);
    }

    // SMTP секція
    add_settings_section('rw_smtp', 'SMTP', null, 'rw-mail-settings');
    foreach (['rw_smtp_host', 'rw_smtp_port', 'rw_smtp_user', 'rw_smtp_pass'] as $key) {
        add_settings_field($key, $fields[$key]['label'], 'rw_render_field', 'rw-mail-settings', 'rw_smtp', [
            'key'  => $key,
            'type' => $fields[$key]['type'],
        ]);
    }

    // Відправник секція
    add_settings_section('rw_sender', 'Sender', null, 'rw-mail-settings');
    foreach (['rw_from_email', 'rw_from_name'] as $key) {
        add_settings_field($key, $fields[$key]['label'], 'rw_render_field', 'rw-mail-settings', 'rw_sender', [
            'key'  => $key,
            'type' => $fields[$key]['type'],
        ]);
    }

    // Форми секція
    add_settings_section('rw_forms', 'Form Recipients', null, 'rw-mail-settings');
    foreach (['rw_email_book', 'rw_email_contact', 'rw_email_newsletter'] as $key) {
        add_settings_field($key, $fields[$key]['label'], 'rw_render_field', 'rw-mail-settings', 'rw_forms', [
            'key'  => $key,
            'type' => $fields[$key]['type'],
        ]);
    }

    // Fallback секція
    add_settings_section('rw_fallback', 'Fallback', null, 'rw-mail-settings');
    foreach (['rw_recipient_email', 'rw_recipient_name'] as $key) {
        add_settings_field($key, $fields[$key]['label'], 'rw_render_field', 'rw-mail-settings', 'rw_fallback', [
            'key'  => $key,
            'type' => $fields[$key]['type'],
        ]);
    }
});

// ─── Рендер поля ──────────────────────────────────────────────────────────────
function rw_render_field(array $args): void
{
    $key   = $args['key'];
    $type  = $args['type'] ?? 'text';
    $value = get_option($key, '');

    // Password — не виводимо значення, показуємо placeholder
    if ($type === 'password') {
        printf(
            '<input type="password" name="%s" id="%s" value="%s" autocomplete="new-password" class="regular-text">',
            esc_attr($key),
            esc_attr($key),
            esc_attr($value)
        );
        if ($value) {
            echo ' <span style="color:#46b450">&#10003; saved</span>';
        }
        return;
    }

    printf(
        '<input type="%s" name="%s" id="%s" value="%s" class="regular-text">',
        esc_attr($type),
        esc_attr($key),
        esc_attr($key),
        esc_attr($value)
    );
}

// ─── Рендер сторінки ──────────────────────────────────────────────────────────
function rw_render_mail_settings_page(): void
{
    if (!current_user_can('manage_options')) return;
    ?>
    <div class="wrap">
        <h1>Mail Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('rw_mail_settings');
            do_settings_sections('rw-mail-settings');
            submit_button('Save Settings');
            ?>
        </form>
    </div>
    <?php
}
