var gulp=require("gulp");
var runSequence = require('run-sequence');
var browser = require("browser-sync").create();
var webpack = require("webpack-stream");
var plumber = require("gulp-plumber");
var eslint = require('gulp-eslint');
var uglifyes = require('uglify-es');
var composer = require('gulp-uglify/composer');
var pump = require('pump');

var minify = composer(uglifyes, console);

gulp.task("browserSync", function() {
  browser.init({
    server:{
      baseDir:"./"
    },
    open:false
  });
});
gulp.task("reload",function(){
  browser.reload()
})

gulp.task("lint",function(){
  gulp.src(["component/*.js","js/*.js"])
    .pipe(plumber({
      errorHandler: function(error) {
        var taskName = 'eslint';
        var title = '[task]' + taskName + ' ' + error.plugin;
        var errorMsg = 'error: ' + error.message;
        console.error(title + '\n' + errorMsg);
      }
    }))
    .pipe(eslint({ useEslintrc: true })) // .eslintrc を参照
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(plumber.stop());
})
gulp.task('webpack', function(){
  return gulp.src('js/main.js')
    .pipe(webpack(require("./webpack.config.dev")))
    .pipe(gulp.dest('./'))
    .pipe(browser.stream());
});
gulp.task('webpackProd', function(){
  return gulp.src('js/main.js')
    .pipe(webpack(require("./webpack.config")))
    .pipe(gulp.dest('./'))
});
gulp.task("watch", function() {
  gulp.watch("dist/dist.js", ["reload"]);
  gulp.watch("index.html",["reload"]);
  gulp.watch(["component/*.js","js/*.js"],["lint"]);
});
gulp.task("setCordova", function() {
  return gulp.src(["dist/**"])
    .pipe(gulp.dest("../monya-app/www/dist"))
});

gulp.task("default", function(cb) {
  return runSequence(
    ['browserSync',"webpack","watch"],
    cb
  );
});
gulp.task("prod", function(cb) {
  return runSequence(
    ["lint","webpackProd"],
    "setCordova",
    cb
  );
});

