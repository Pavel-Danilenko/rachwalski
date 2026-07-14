<?php
/**
 * single-treatment.php — один шаблон для ВСІХ сторінок послуг (CPT "treatment").
 *
 * Фіксована частина — тільки hero (заголовок з post_title + фонове зображення).
 * Все інше нижче — вільний контент через the_content() (Gutenberg-редактор +
 * власні ACF Blocks), навмисно не окремі ACF-поля — щоб кожна сторінка могла
 * мати свій набір/порядок/кількість секцій (quote, quick facts, картки,
 * FAQ...) без обмежень жорсткого шаблону. Див. пам'ять проєкту
 * (project_wp_launch_plan) для контексту рішення.
 */

get_header();

while (have_posts()):
   the_post();

   $hero_image        = get_field('hero_image');
   $hero_image_mobile  = get_field('hero_image_mobile') ?: $hero_image;
?>

<section class="rhinoplasty-hero hero-circle">
   <picture class="rhinoplasty-hero__img hero-mask hero-mask-top">
      <?php if ($hero_image_mobile): ?>
         <source media="(max-width: 767px)" srcset="<?php echo esc_url($hero_image_mobile); ?>">
      <?php endif; ?>
      <?php if ($hero_image): ?>
         <img src="<?php echo esc_url($hero_image); ?>" alt="" loading="eager" fetchpriority="high">
      <?php endif; ?>
   </picture>

   <div class="rhinoplasty-hero__container hero-full-vh">
      <h1 class="rhinoplasty-hero__title t-center">
         <?php the_title(); ?>
      </h1>
   </div>
</section>

<section class="services-content bg-white light-gradientp-top">
   <div class="services-content__container pb-80">
      <?php the_content(); ?>
   </div>
</section>

<?php
endwhile;

get_footer();
