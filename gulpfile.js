const
// Gulp tools
  gulp          = require('gulp'),
  gulpif        = require('gulp-if'),
  plumber       = require('gulp-plumber'),
  runSequence   = require('run-sequence'),
  del           = require('del'),
  rename        = require('gulp-rename'),

  // Images tools
  svgSprite     = require('gulp-svg-sprite'),
  imagemin      = require('gulp-imagemin'),

  // JavaScript tools
  webpack       = require('webpack-stream'),
  sourcemaps    = require('gulp-sourcemaps'),
  babel         = require('gulp-babel'),
  uglify        = require('gulp-uglify'),

  // CSS tools
  postcss       = require('gulp-postcss'),
  precss        = require('precss'),
  autoprefixer  = require('autoprefixer'),
  lost          = require('lost'),
  cssnext       = require('postcss-cssnext'),
  purify        = require('gulp-purifycss'),
  mqpacker      = require('css-mqpacker'),
  cssnano       = require('cssnano'),

  // Server tools
  browserSync   = require('browser-sync'),
  reload        = browserSync.reload,
  htmlmin       = require('gulp-htmlmin'),

  // Configuration settings
  config = {

    folders: {
      dev: 'build',
      src: '.',
      prod: 'production'
    },

    assets: {
      js: 'js/*.js',
      css: {
        base: 'css/main.css',
        final: 'style.css'
      },
      imgs: 'img',
      svg: '**/*.svg',
      copy: [
        '*fonts/*.+(eot|woff|ttf|svg)',
        'root/*.*',
        'html/**/*.html',
        'index.*']
    },

    webpack: {
      entry: {
        main: './js/main.js'
      },
      output: {
        filename: '[name].js',
        path: __dirname + '/build'
      }
    },

    babel: {
      presets: ['es2015']
    },

    postcss: {
      dev: [
        precss(),
        cssnext({ browsers: ['last 2 versions']}),
        lost,
        mqpacker
      ],
      prod: [
        autoprefixer({ browsers: ['last 2 versions']}),
        cssnano
      ]
    },

    svgsprite: {
      shape: {
        dimension: { maxWidth: 48, maxHeight: 48},
        spacing: { padding: 4},
        transform: ['svgo']
      },
      mode: {
        symbol: {
          dest: '.',
          sprite: 'icons',
          example: false
        }
      }
    },

    imagemin: {
      optimizationLevel: 7,
      progressive: true,
      interlace: true,
      multipass: true
    }

  },

  // Shorthand variables
  {dev: DEV, src: SRC, prod: PROD} = config.folders,
  {imgs: IMAGES, css: STYLES, svg: SVGFILES, js: SCRIPTS, copy: FILES} = config.assets,
  SVGSPRITE = config.svgsprite.mode.symbol.sprite;

// Environment flag
let production = false;

gulp.task('set-production', () => {
  production = true;
});

// Partial gulp tasks
gulp.task('css', () => {
  const src = production ? `${DEV}/${STYLES.final}` : `${SRC}/${STYLES.base}`;
  const dest = production ? PROD : DEV;

  return gulp.src(src)
    .pipe(plumber())
    .pipe(gulpif(production, purify([`${DEV}/**/*.js`, `${DEV}/**/*.html`])))
    .pipe(gulpif(production, postcss(config.postcss.prod), postcss(config.postcss.dev)))
    .pipe(rename(STYLES.final))
    .pipe(gulp.dest(dest));
});

gulp.task('svg', () => {
  const src = production ? `${DEV}/${IMAGES}/${SVGSPRITE}.svg` : `${SRC}/${IMAGES}/${SVGFILES}`;
  const dest = production ? PROD : DEV;

  return gulp.src(src)
    .pipe(plumber())
    .pipe(gulpif(!production, svgSprite(config.svgsprite)))
    .pipe(gulp.dest(`${dest}/${IMAGES}`));
});

gulp.task('images', () => {
  const src = production ? DEV : SRC;
  const dest = production ? PROD : DEV;

  return gulp.src(`${src}/${IMAGES}/**/*.+(gif|jpg|png|woff)`)
    .pipe(plumber())
    .pipe(gulpif(production, imagemin(config.imagemin)))
    .pipe(gulp.dest(`${dest}/${IMAGES}`));
});

gulp.task('scripts', () => {
  if (production) {

    return gulp.src(`${DEV}/*.js`)
      .pipe(plumber())
      .pipe(uglify({
        mangle: true
      }))
      .pipe(gulp.dest(PROD));
  } else {

    return gulp.src(SCRIPTS)
      .pipe(plumber())
      .pipe(webpack(config.webpack))
      .pipe(sourcemaps.init())
      .pipe(babel(config.babel))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(DEV))
      .pipe(reload({
        stream: true
      }));
  }
});

gulp.task('html', () => {
  return gulp.src(`${DEV}/**/*.html`)
    .pipe(plumber())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(PROD));
});

gulp.task('delete', () => {
  const folder = production ? PROD : DEV;
  return del([folder]);
});

gulp.task('copy', function () {
  const dest = production ? PROD : DEV;

  return gulp.src(FILES)
    .pipe(plumber())
    .pipe(gulp.dest(dest));
});

gulp.task('serve', () => {
  const base = production ? PROD : DEV;

  browserSync.init({
    server: {
      baseDir: `./${base}/`
    },
    open: production,
    ghostMode: {
      clicks: !production,
      forms: !production,
      scroll: false
    }});
});

gulp.task('watch', () => {
  gulp.watch('*css/**/*.css', ['css', reload]);
  gulp.watch(['*js/**/*.js'], ['scripts', reload]);
  gulp.watch(FILES, ['copy', reload]);
  gulp.watch([IMAGES+'/**/*.+(gif|jpg|png|woff)'], ['images', reload]);
  gulp.watch([IMAGES+'/**/*.svg'], ['svg', reload]);
});

// Gulp scripts
gulp.task('build',      (cb) => { runSequence('delete', ['css', 'svg', 'images', 'copy', 'scripts'], cb); });
gulp.task('production', (cb) => { runSequence('build', 'set-production', 'build', 'html', 'serve', cb); });
gulp.task('default',    (cb) => { runSequence('build', 'serve', 'watch', cb); });
