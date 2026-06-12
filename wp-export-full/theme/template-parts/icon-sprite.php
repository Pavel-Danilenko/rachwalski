<?php
/**
 * SVG-спрайт з усіма іконками сайту.
 * Підключається один раз, одразу після <body>, через get_template_part('template-parts/icon-sprite').
 */
readfile(get_theme_file_path('template-parts/icon-sprite.svg'));
