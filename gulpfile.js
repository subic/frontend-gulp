const
// gulp related
gulp            = require('gulp'),
clean           = require('gulp-clean'),
runSequence     = require('run-sequence'),
browserSync     = require('browser-sync'),
plumber         = require('gulp-plumber'),
gulpif         = require('gulp-if'),
reload          = browserSync.reload,

//images build
svgSprite       = require('gulp-svg-sprite'),
imagemin        = require('gulp-imagemin'),

// javascript build
webpack         = require('webpack-stream'),
sourcemaps      = require('gulp-sourcemaps'),
babel           = require('gulp-babel'),
concat          = require('gulp-concat'),
uglify          = require('gulp-uglify'),
rename          = require('gulp-rename'),

// (post)css
postcss        = require('gulp-postcss'),
precss         = require('precss'),
autoprefixer   = require('autoprefixer'),
lost           = require('lost'),
cssnext        = require('postcss-cssnext'),
purify         = require('gulp-purifycss'),
mqpacker       = require('css-mqpacker'),
cssnano        = require('cssnano'),

htmlmin        = require('gulp-htmlmin'),

config = {

  folders: {
    dev: 'build',
    src: '.',
    prod: 'production',
  },

  assets: {
    js: 'js/*.js',
    css: {
      base: 'css/main.css',
      final: 'style.css',
    },
    imgs: 'img',
    svg: '/**/*.svg',
    copy: [
        '*fonts/*.+(eot|woff|ttf|svg)',
        'root/*.*',
        'html/**/*.html',
        'index.*'
    ]
  },

  webpack: {
    entry: {
      main: "./js/main.js"
    },
    output: {
      filename: "[name].js",
      path: __dirname + "/build",
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
    multipass: true,
  }

};

let production = false;

gulp.task('set-production', () => {
  production = true;
});

gulp.task('css', () => {
  const src = production ? config.folders.dev+'/'+config.assets.css.final : config.folders.src+'/'+config.assets.css.base;
  const dest = production ? config.folders.prod : config.folders.dev;

  return gulp.src(src)
    .pipe(plumber())
    .pipe(gulpif(production, purify([config.folders.dev+'/**/*.js', config.folders.dev+'/**/*.html'])))
    .pipe(gulpif(production, postcss(config.postcss.prod), postcss(config.postcss.dev)))
    .pipe(rename(config.assets.css.final))
    .pipe(gulp.dest(dest))
});

gulp.task('svg', () => {
  const src = production ? `${config.folders.dev}/${config.assets.imgs}/${config.svgsprite.mode.symbol.sprite}.svg` : `${config.folders.src}/${config.assets.imgs}${config.assets.svg}`;
  const dest = production ? config.folders.prod : config.folders.dev;

  return gulp.src(src)
    .pipe(plumber())
    .pipe(gulpif(!production, svgSprite(config.svgsprite)))
    .pipe(gulp.dest(`${dest}/${config.assets.imgs}`));
});

gulp.task('images', () => {
  const src = (production) ? config.folders.dev : config.folders.src;
  const dest = (production) ? config.folders.prod : config.folders.dev;

  return gulp.src(`${src}/${config.assets.imgs}/**/*.+(gif|jpg|png|woff)`)
    .pipe(plumber())
    .pipe(gulpif(production, imagemin(config.imagemin)))
    .pipe(gulp.dest(`${dest}/${config.assets.imgs}`));
});

gulp.task('scripts', () => {
  if (production) {

    return gulp.src(config.folders.dev+'/*.js')
      .pipe(plumber())
      .pipe(uglify({ mangle: true }))
      .pipe(gulp.dest(config.folders.prod));
  } else {

    return gulp.src(config.assets.js)
      .pipe(plumber())
      .pipe(webpack(config.webpack))
      .pipe(sourcemaps.init())
      .pipe(babel(config.babel))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(config.folders.dev))
      .pipe(reload({ stream: true }));
  }
});

gulp.task('html', () => {
  return gulp.src(`${config.folders.dev}/**/*.html`)
    .pipe(plumber())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.folders.prod));
});

gulp.task('clean', () => {
  const folder = production ? config.folders.prod: config.folders.dev;

  return gulp.src(folder, { read: false })
    .pipe(clean());
});

gulp.task('copy', function () {
  const dest = production ? config.folders.prod : config.folders.dev;

  return gulp.src(config.assets.copy)
    .pipe(plumber())
    .pipe(gulp.dest(dest));
});

gulp.task('serve', () => {
  const base = production ? config.folders.prod : config.folders.dev;

  browserSync.init({
    server: { baseDir: `./${base}/` },
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
   gulp.watch(config.assets.copy, ['copy', reload]);
   gulp.watch([config.assets.imgs+'/**/*.+(gif|jpg|png|woff)'], ['images', reload]);
   gulp.watch([config.assets.imgs+'/**/*.svg'], ['svg', reload]);
});

gulp.task('build', (cb) => { runSequence('clean', ['css', 'svg', 'images', 'copy', 'scripts'], cb); });

gulp.task('production', (cb) => { runSequence('build', 'set-production', 'build', 'html', 'serve', cb); });

gulp.task('default', (cb) => {runSequence('build', 'serve', 'watch', cb); });
