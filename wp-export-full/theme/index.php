<?php get_header(); ?>

<section style="padding: 200px 0;">
   <div class="container">
      <h1>Тестова сторінка — перевірка футера</h1>
      <?php
      if (have_posts()):
         while (have_posts()): the_post();
            the_content();
         endwhile;
      endif;
      ?>
   </div>
</section>

<?php get_footer(); ?>
