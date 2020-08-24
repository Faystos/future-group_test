const gulp = require('gulp');
const plumber = require("gulp-plumber");
const htmlmin = require('gulp-htmlmin');
const less = require('gulp-less');
const srcmap = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const server = require("browser-sync").create();
const del = require("del");
const copy = require("copy");
const imagemin = require("gulp-imagemin");

const  minify = () => {
  return gulp.src('src/*.html')
         .pipe(htmlmin({ collapseWhitespace: true }))
         .pipe(gulp.dest('dist'));
}

const css = () => {
  return gulp.src('./src/less/style.less')
         .pipe(plumber())
         .pipe(srcmap.init())
         .pipe(less())
         .pipe(postcss([autoprefixer()]))
         .pipe(csso())
         .pipe(rename("style.min.css"))
         .pipe(srcmap.write("."))
         .pipe(gulp.dest('./dist/css'))
         .pipe(server.stream());
}

const images = () => {
  return gulp.src("src/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({
      optimizationLevel: 3
    }),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("dist/img"));
}

const refresh = (done) => {
  server.reload();
  done();
}

const clean = () => {
  return del("dist");
}

const copys = () => {
  return gulp.src([
    "src/fonts/**",
    "src/img/**",
    "src/js/**",
    "src/*.ico"
  ], {
    base: "src"
  })
  .pipe(gulp.dest("dist"));
}

const gulpServer = () => {
  server.init({
    server: "dist/",
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("src/less/**/*.less", gulp.series(css, refresh));
  gulp.watch("src/*.html", gulp.series(minify, refresh));
  gulp.watch([
    "src/fonts/**/*",
    "src/img/**/*",
    "src/js/**/*",
    "src/*.ico"
  ], gulp.series(copys, refresh));
} 

const build = gulp.series(  
    clean,
    copys,
    css,
    images,
    minify  
);

const start = gulp.series(build, gulpServer);

module.exports.start = start;
module.exports.build = build;