<?php
$default_bg = rachwalski_get_footer_setting('default_bg');

$footer_bg = get_field('footer_background_image')
   ?: $default_bg
   ?: get_template_directory_uri() . '/assets/img/footer/footer-bg.png';

$show_newsletter = rachwalski_get_footer_setting('show_newsletter');
$show_socials    = rachwalski_get_footer_setting('show_socials');
$show_book_btn   = rachwalski_get_footer_setting('show_book_btn');

// Privacy/Legal Mentions/Cookies — показуємо лінк, якщо існує сторінка з відповідним слагом
$footer_pages = [
   'Privacy'        => get_page_by_path('privacy-policy'),
   'Legal Mentions' => get_page_by_path('legal-mentions'),
   'Cookies'        => get_page_by_path('cookies'),
];

// Дефолтні соц. мережі — поки клієнт не додав записи в CPT "Social Links"
$default_socials = [
   ['platform' => 'instagram', 'url' => '#', 'label' => null, 'icon' => null],
   ['platform' => 'linkedin', 'url' => '#', 'label' => null, 'icon' => null],
   ['platform' => 'facebook', 'url' => '#', 'label' => null, 'icon' => null],
   ['platform' => 'twitter', 'url' => '#', 'label' => null, 'icon' => null],
   ['platform' => 'youtube', 'url' => '#', 'label' => null, 'icon' => null],
];
?>

   </main>
</div>

<footer class="footer">
   <div class="img-wrapper footer__bg">
      <img src="<?php echo esc_url($footer_bg); ?>" alt="footer background" class="img-wrapper__img" loading="lazy">
   </div>

   <div class="footer__container pt-80 pb-35">
      <div class="footer__grid">

         <?php if ($show_newsletter): ?>
         <div class="footer__newslatter footer-newsletter">
            <h2 class="footer-newsletter__title mb-12">
               Stay Connected with Dr. Martin Rachwalski
            </h2>
            <div class="footer-newsletter__text mb-30 fs-20">
               Subscribe to be the first who know about new treatments, expert
               insights from Dr. Martin.
            </div>

            <div class="footer-newsletter__form footer-form mb-50">
               <!-- TODO: підключити обробку форми (mail/admin-post) -->
               <form action="#" method="post" class="footer-form">
                  <div class="form-fields footer-form__fields">
                     <div class="form-group footer-form__group">
                        <input
                           class="footer-form__input glass"
                           type="email"
                           name="email"
                           placeholder="Enter your email"
                           required
                        />
                     </div>

                     <button class="btn white-btn btn--medium footer-form__btn" type="submit">
                        Subscribe
                     </button>
                  </div>
               </form>
            </div>
            <div class="footer-newsletter__icon">
               <?php rachwalski_icon('daimond'); ?>
            </div>
         </div>
         <?php endif; ?>

         <div class="footer__conatct footer-contact">
            <div class="footer-contact__column-left">
               <a href="<?php echo esc_url(home_url('/')); ?>" class="logo footer-contact__logo">
                  <img src="<?php echo esc_url(get_template_directory_uri()); ?>/assets/img/logo.svg" alt="<?php bloginfo('name'); ?>" class="logo__img">
               </a>

               <?php if ($show_socials): ?>
               <div class="footer-contact__socials">
                  <?php
                  $socials = rachwalski_get_social_links();
                  if (empty($socials)) {
                     $socials = $default_socials;
                  }

                  foreach ($socials as $social):
                     $platform = $social['platform'];
                     $label    = $platform === 'custom'
                        ? ($social['label'] ?: 'Social link')
                        : rachwalski_social_label($platform);
                  ?>
                     <a
                        href="<?php echo esc_url($social['url']); ?>"
                        class="footer-contact__link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="<?php echo esc_attr($label); ?>"
                     >
                        <?php if ($platform === 'custom' && !empty($social['icon'])): ?>
                           <img src="<?php echo esc_url($social['icon']); ?>" alt="" class="footer-contact__custom-icon">
                        <?php else: ?>
                           <?php rachwalski_icon($platform); ?>
                        <?php endif; ?>
                     </a>
                  <?php endforeach; ?>
               </div>
               <?php endif; ?>
            </div>

            <?php if ($show_book_btn): ?>
            <button type="button" data-popup-open="book" class="btn btn--medium white-btn footer-contact__btn">
               Book consultation
            </button>
            <?php endif; ?>
         </div>

      </div>
   </div>

   <div class="footer__bottom footer-copy__container">
      <p class="footer__copyright">&copy; <?php echo esc_html(date('Y')); ?> RACHWALSKI. All rights reserved.</p>

      <div class="footer__list">
         <?php foreach ($footer_pages as $label => $page): ?>
            <?php if ($page): ?>
               <a href="<?php echo esc_url(get_permalink($page)); ?>" class="footer__link"><?php echo esc_html($label); ?></a>
            <?php endif; ?>
         <?php endforeach; ?>
      </div>
   </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
