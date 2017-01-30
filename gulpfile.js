const
// gulp related
gulp            = require('gulp'),
clean           = require('gulp-clean'),
runSequence     = require('run-sequence'),
browserSync     = require('browser-sync'),
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

// DIRECTORY STRUCTURE
jsmain           = "js/*.js",
cssmain          = "css/main.css",
imagesdir        = "img",
builddir         = "build",
fontsdir         = "fonts",
productiondir    = "production";


gulp.task('styles', () => {
  const processors = [
    precss(),
    cssnext({browsers: ['last 2 versions']}),
    lost,
    mqpacker,
  ];
  return gulp.src(cssmain)
    .pipe(postcss(processors))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(builddir))
});

gulp.task('styles-production', () => {
  const processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    cssnano
  ];
  return gulp.src(builddir+'/style-cleaned.css')
    .pipe(postcss(processors))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(productiondir))
});

gulp.task('purifycss', () => {
  return gulp.src(builddir+'/style.css')
    .pipe(rename('style-cleaned.css'))
    .pipe(purify([builddir+'/**/*.js', builddir+'/**/*.html']))
    .pipe(gulp.dest(builddir+'/'))
});

gulp.task('svg', () => {
  return gulp.src(imagesdir+'/**/*.svg')
    .pipe(svgSprite({
    shape               : {
        dimension       : {
            maxWidth    : 48,
            maxHeight   : 48
       },
       spacing         : {
            padding     : 4
       },
         transform       : ['svgo']
    },
    mode                : {
        symbol : {
            dest: '.',
            sprite: 'icons',
            example: false
        }
    }
}))
    .pipe(gulp.dest(builddir+'/img'));
});

gulp.task('svg-production', () => {
  return gulp.src(builddir+'/img/icons.svg')
    .pipe(gulp.dest(productiondir+'/img'));
});

gulp.task('images', () => {
  return gulp.src(imagesdir+'/**/*.+(gif|jpg|png|woff)')
    .pipe(gulp.dest(builddir+'/img'));
});

gulp.task('images-production', () => {
  return gulp.src(builddir+'/'+imagesdir+'/**/*.+(gif|jpg|png|woff)')
    .pipe(imagemin({
      optimizationLevel: 7,
      progressive: true,
      interlace: true,
      multipass: true,
    }))
    .pipe(gulp.dest(productiondir+'/img'));
});

gulp.task('scripts', () => {
  return gulp.src(jsmain)
       .pipe(webpack({
          entry: {
            main: "./js/main.js"
          },
          output: {
            filename: "[name].js",
            path: __dirname + "/build",
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(builddir))
    .pipe(reload({stream:true}));
});

gulp.task('scripts-production', () => {
  return gulp.src(builddir+'/*.js')
    .pipe(uglify({mangle:true}))
    .pipe(gulp.dest(productiondir));
});

gulp.task('clean', () => {
    return gulp.src(builddir, {read: false})
        .pipe(clean());
});

gulp.task('clean-production', () => {
    return gulp.src(productiondir, {read: false})
        .pipe(clean());
});

// File copy scripts
gulp.task('fonts', () => {
  return gulp.src(fontsdir+'/**/*.*')
    .pipe(gulp.dest(builddir+'/fonts'));
});

gulp.task('fonts-production', () => {
  return gulp.src(fontsdir+'/**/*.*')
    .pipe(gulp.dest(productiondir+'/fonts'));
});

gulp.task('root', () => {
  return gulp.src('root/**/*.*')
    .pipe(gulp.dest(builddir));
});

gulp.task('root-production', () => {
  return gulp.src(['root/**/*.*', '!**/*.html'])
    .pipe(gulp.dest(productiondir));
});

gulp.task('html', () => {
  return gulp.src(['html/**/*.html'])
    .pipe(gulp.dest(builddir));
});

gulp.task('html-production', () => {
  return gulp.src(builddir+'/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(productiondir));
});


gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: "./"+builddir+"/"
    },
    open: false,
    ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
    }
  });

  gulp.watch('css/**/*.css', ['styles', reload]);
  gulp.watch(['js/**/*.js'], ['scripts', reload]);
  gulp.watch(['**/*.html'], ['html', reload]);
  gulp.watch(['fonts/**/*.*'], ['fonts', reload]);
  gulp.watch(['root/**/*.*'], ['root', reload]);
  gulp.watch(['img/**/*.+(gif|jpg|png)'], ['images', reload]);
  gulp.watch(['img/**/*.svg'], ['svg', reload]);
});

gulp.task('serve-production', () => {
  browserSync.init({
    server: {
      baseDir: "./"+productiondir+"/"
    },
    open: true
  });
});

gulp.task('build', (cb) => {
    runSequence('clean', ['styles', 'html', 'svg', 'images', 'root', 'fonts', 'scripts'], cb);
});

gulp.task('production', (cb) => {
    runSequence('build', 'clean-production', 'purifycss',
    ['styles-production', 'svg-production', 'images-production', 'root-production', 'fonts-production', 'scripts-production'],
     'html-production', 'serve-production', cb);
});

gulp.task('default', (cb) => {
    runSequence('build', 'serve', cb);
});