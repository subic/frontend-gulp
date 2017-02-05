# Frontend gulp build tools

Script for a simple frontend build with some defaults which can be extended and customized. Optimizes css, images, html and JavaScript for production and creates a svg symbol sprite.

## Getting Started

#### Project setup

Clone or download the repository and install dependencies:

```
npm install
```

Customize the config variable in the [gulpfile](gulpfile.js) to your liking. An initial default folder structure can be setup by running:

```
npm run build
```

#### Running gulp

Default gulp task is optimized for production and includes browsersync with active file watching. Just run:

```
gulp
```

To prepare the production files (minimize, copy and remove sourcemaps and unused css definitions), run the production gulp task:

```
gulp production
```

For production, images are processed with imagemin which can take some time if source images are not optimized already.

## Tools

* [gulp](http://gulpjs.com/) - Build system automating tasks
* [webpack](https://webpack.github.io/) - Module bundler
* [PostSCC](http://postcss.org/) - A tool for transforming CSS with JavaScript
* [imagemin](https://github.com/imagemin/imagemin) - Minify images seamlessly
* [svg-sprite](https://github.com/jkphl/svg-sprite) - SVG sprites & stacks galore

## Dependencies

* [npm](https://www.npmjs.com/) - Package manager for JavaScript

See [package.json](package.json) for the whole list.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Additional resources

Some useful links for further customizing your build process:

#### gulp

* **[Getting started - Web](https://developers.google.com/web/tools/setup/)** Some web development workspace and tool suggestions from Google Developers.
* **[Introduction to Gulp.js](https://stefanimhoff.de/tags/gulp/)** An expansive tutorial on setting up a gulp workflow by Stefan Imhoff. Great starting point and reference.
* **[Gulp documentation](https://github.com/gulpjs/gulp/blob/master/docs/README.md)** Official gulp documentation with many examples and articles.

#### SVG icons

* **[How to work with SVG icons](https://fvsch.com/code/svg-icons/how-to/)** An SVG icons primer by Florens Verschelde. Everything from export to implementation.
* **[Creating an SVG icon workflow](https://lukewhitehouse.co.uk/blog/svg-icon-workflow/)** A tutorial by Luke Whitehouse that covers gulp and SVG icons integration with fallbacks for older broswers.
* **[Creating SVG sprites using gulp and Sass](https://www.liquidlight.co.uk/blog/article/creating-svg-sprites-using-gulp-and-sass/)** SVG and Sass with gulp example by Mike Street.
* **[A Gulp-Based External SVG Symbol Sprite Icon System](http://una.im/svg-icons/)** Some considerations for SVG icons implementation by Una Kravets.

#### Static site

* **[Using A Static Site Generator At Scale: Lessons Learned](https://www.smashingmagazine.com/2016/08/using-a-static-site-generator-at-scale-lessons-learned/)** Some considerations for choosing your page html templates manager by Stefan Baumgartner.
* **[How to Modularize HTML Using Template Engines and Gulp](https://zellwk.com/blog/nunjucks-with-gulp/)** An example integration of nunjucks templates into a gulp workflow by Zell Liew.

#### Webpack

* **[Unpacking Webpack](https://blog.tighten.co/unpacking-webpack)** A tutorial for replacing gulp with a purely webpack based workflow by Samantha Geitz.
* **[Getting Started with webpack 2](https://blog.madewithenvy.com/getting-started-with-webpack-2-ed2b86c68783)** Webpack basics and multiple files examples by Drew Powers that also covers fully webpack based workflow.
* **[A Beginner’s Guide to Webpack 2 and Module Bundling](https://www.sitepoint.com/beginners-guide-to-webpack-2-and-module-bundling/)** A guide by Mark Brown which covers initial webpack setup and configuration, modules, loaders, plugins, code splitting and hot module replacement.

#### PostCSS

* **[PostCSS Deep Dive](https://webdesign.tutsplus.com/series/postcss-deep-dive--cms-889)** A great PostCSS reference and tutorial series by Kezz Bracey.

