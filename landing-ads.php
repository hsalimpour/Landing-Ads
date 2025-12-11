<?php
/**
 * Plugin Name: تبلیغ لندینگ
 * Description: افزودن شورت‌کد برای نمایش چند صفحه به صورت کارت و انجام لینک‌سازی داخلی.
 * Version: 1.0.3
 * Author: شرکت آرتیاش
 * Author URI: https://www.artiash.com
 * Text Domain: landing-ads
 */

if (!defined('ABSPATH')) {
    exit;
}

class Landing_Ads_Plugin {
    const OPTION_KEY = 'landing_ads_settings';

    public function __construct() {
        add_action('init', [$this, 'register_shortcode']);
        add_action('admin_menu', [$this, 'register_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_filter('the_posts', [$this, 'maybe_enqueue_front_assets']);

        // Editor button.
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_filter('mce_buttons', [$this, 'add_mce_button']);
        add_filter('mce_external_plugins', [$this, 'add_mce_plugin']);
    }

    public function register_shortcode() {
        add_shortcode('landing_ads', [$this, 'render_shortcode']);
    }

    public function register_assets() {
        wp_register_style(
            'landing-ads-style',
            plugins_url('assets/css/landing-ads.css', __FILE__),
            [],
            '1.0.3'
        );

        wp_register_script(
            'landing-ads-frontend',
            plugins_url('assets/js/landing-ads-frontend.js', __FILE__),
            [],
            '1.0.3',
            true
        );
    }

    public function maybe_enqueue_front_assets($posts) {
        if (empty($posts)) {
            return $posts;
        }

        foreach ($posts as $post) {
            if (has_shortcode($post->post_content, 'landing_ads')) {
                wp_enqueue_style('landing-ads-style');
                wp_enqueue_script('landing-ads-frontend');
                break;
            }
        }

        return $posts;
    }

    public function render_shortcode($atts) {
        $defaults = $this->get_settings();

        $atts = shortcode_atts(
            [
                'pages'       => '',
                'count'       => $defaults['default_count'],
                'title_color' => $defaults['title_color'],
                'title_size'  => $defaults['title_size'],
                'target'      => $defaults['link_target'],
            ],
            $atts,
            'landing_ads'
        );

        $ids = array_filter(array_map('absint', array_map('trim', explode(',', $atts['pages']))));

        $has_ids = !empty($ids);
        $query_args = [
            'post_type'      => $has_ids ? ['page', 'post'] : 'page',
            'posts_per_page' => intval($atts['count']),
        ];

        if (!empty($ids)) {
            $query_args['post__in'] = $ids;
            $query_args['orderby']  = 'post__in';
        }

        $query = new WP_Query($query_args);

        if (!$query->have_posts()) {
            return '';
        }

        wp_enqueue_style('landing-ads-style');

        $cards = [];
        $title_color = sanitize_hex_color($atts['title_color']) ?: '#111111';
        $title_size  = $this->sanitize_font_size($atts['title_size']);
        $target      = $atts['target'] === '_blank' ? '_blank' : '_self';

        while ($query->have_posts()) {
            $query->the_post();
            $post_id    = get_the_ID();
            $title      = get_the_title();
            $permalink  = get_permalink();
            $thumb_url  = get_the_post_thumbnail_url($post_id, 'medium');

            $cards[] = sprintf(
                '<div class="landing-ads-card">'
                . '<a class="landing-ads-thumb" href="%1$s" target="%2$s" rel="follow">%3$s</a>'
                . '<a class="landing-ads-title" href="%1$s" target="%2$s" rel="follow" style="color:%4$s;font-size:%5$s;">%6$s</a>'
                . '</div>',
                esc_url($permalink),
                esc_attr($target),
                $thumb_url ? '<img src="' . esc_url($thumb_url) . '" alt="' . esc_attr($title) . '">' : '<span class="landing-ads-placeholder"></span>',
                esc_attr($title_color),
                esc_attr($title_size),
                esc_html($title)
            );
        }

        wp_reset_postdata();

        return '<div class="landing-ads-wrap">' . implode('', $cards) . '</div>';
    }

    private function sanitize_font_size($size) {
        $size = trim($size);
        if (preg_match('/^\d+(\.\d+)?(px|rem|em|%)?$/', $size)) {
            return $size;
        }
        $int = intval($size);
        if ($int > 0) {
            return $int . 'px';
        }
        return '18px';
    }

    public function register_settings_page() {
        add_options_page(
            __('تبلیغ لندینگ', 'landing-ads'),
            __('تبلیغ لندینگ', 'landing-ads'),
            'manage_options',
            'landing-ads',
            [$this, 'render_settings_page_html']
        );
    }

    public function register_settings() {
        register_setting('landing_ads_settings_group', self::OPTION_KEY, [$this, 'sanitize_settings']);

        add_settings_section(
            'landing_ads_main_section',
            __('تنظیمات نمایش', 'landing-ads'),
            '__return_false',
            'landing-ads'
        );

        add_settings_field(
            'title_color',
            __('رنگ عنوان', 'landing-ads'),
            [$this, 'render_field_color'],
            'landing-ads',
            'landing_ads_main_section'
        );

        add_settings_field(
            'title_size',
            __('سایز متن عنوان', 'landing-ads'),
            [$this, 'render_field_title_size'],
            'landing-ads',
            'landing_ads_main_section'
        );

        add_settings_field(
            'link_target',
            __('تارگت لینک', 'landing-ads'),
            [$this, 'render_field_target'],
            'landing-ads',
            'landing_ads_main_section'
        );

        add_settings_field(
            'default_count',
            __('تعداد لندینگ پیش‌فرض', 'landing-ads'),
            [$this, 'render_field_default_count'],
            'landing-ads',
            'landing_ads_main_section'
        );
    }

    public function sanitize_settings($input) {
        $defaults = $this->get_settings();
        $output = [];

        $output['title_color'] = isset($input['title_color']) && sanitize_hex_color($input['title_color'])
            ? sanitize_hex_color($input['title_color'])
            : $defaults['title_color'];

        $output['title_size'] = isset($input['title_size'])
            ? $this->sanitize_font_size($input['title_size'])
            : $defaults['title_size'];

        $output['link_target'] = (isset($input['link_target']) && $input['link_target'] === '_blank') ? '_blank' : '_self';

        $count = isset($input['default_count']) ? absint($input['default_count']) : $defaults['default_count'];
        $output['default_count'] = $count > 0 ? $count : $defaults['default_count'];

        return $output;
    }

    public function render_settings_page_html() {
        if (!current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('تنظیمات تبلیغ لندینگ', 'landing-ads'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('landing_ads_settings_group');
                do_settings_sections('landing-ads');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function render_field_color() {
        $options = $this->get_settings();
        printf(
            '<input type="text" name="%1$s[title_color]" value="%2$s" class="regular-text" placeholder="#111111">',
            esc_attr(self::OPTION_KEY),
            esc_attr($options['title_color'])
        );
    }

    public function render_field_title_size() {
        $options = $this->get_settings();
        printf(
            '<input type="text" name="%1$s[title_size]" value="%2$s" class="regular-text" placeholder="18px">',
            esc_attr(self::OPTION_KEY),
            esc_attr($options['title_size'])
        );
    }

    public function render_field_target() {
        $options = $this->get_settings();
        ?>
        <select name="<?php echo esc_attr(self::OPTION_KEY); ?>[link_target]">
            <option value="_self" <?php selected($options['link_target'], '_self'); ?>><?php esc_html_e('همان صفحه (_self)', 'landing-ads'); ?></option>
            <option value="_blank" <?php selected($options['link_target'], '_blank'); ?>><?php esc_html_e('پنجره جدید (_blank)', 'landing-ads'); ?></option>
        </select>
        <?php
    }

    public function render_field_default_count() {
        $options = $this->get_settings();
        printf(
            '<input type="number" min="1" max="12" name="%1$s[default_count]" value="%2$d">',
            esc_attr(self::OPTION_KEY),
            intval($options['default_count'])
        );
    }

    public function enqueue_admin_scripts($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
            return;
        }

        wp_enqueue_script('wp-api-fetch');
        wp_add_inline_script(
            'wp-api-fetch',
            'window.landingAdsData = window.landingAdsData || {};'
            . 'landingAdsData.restUrl = landingAdsData.restUrl || (window.wpApiSettings ? wpApiSettings.root : "/wp-json/");'
            . 'landingAdsData.nonce = landingAdsData.nonce || (window.wpApiSettings ? wpApiSettings.nonce : "");',
            'after'
        );
    }

    public function add_mce_button($buttons) {
        array_push($buttons, 'landing_ads_button');
        return $buttons;
    }

    public function add_mce_plugin($plugins) {
        $plugins['landing_ads'] = plugins_url('assets/js/landing-ads-editor.js', __FILE__);
        return $plugins;
    }

    private function get_settings() {
        $defaults = [
            'title_color'   => '#111111',
            'title_size'    => '18px',
            'link_target'   => '_self',
            'default_count' => 3,
        ];

        $saved = get_option(self::OPTION_KEY, []);
        if (!is_array($saved)) {
            $saved = [];
        }

        return wp_parse_args($saved, $defaults);
    }
}

new Landing_Ads_Plugin();
