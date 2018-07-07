#!/usr/bin/env node

const https = require('https');
const cheerio = require('cheerio');

const [ movieName ] = process.argv.slice(2);
const URL = makeUrl(movieName);

imdbSearch(URL, (err, movies) => {
  if(err) throw err;
  if(movies.length > 0) {
    movies.forEach(movie => console.log(movie));
    process.exit(1);
  }
  console.log(`No results found for "${movieName}"`);
});



function makeUrl(query) {
  return `https://www.imdb.com/find?ref_=nv_sr_fn&q=${query}&s=all`;
};

function imdbSearch(url, cb) {
  https.get(url, (response) => {
    let html;
    response.setEncoding('utf8');
    response.on('data', chunk => (html+= chunk));
    response.on('end', () => {
      const moviesData = pageParser(html);
      cb(null, moviesData);
    });
  });
};

function pageParser(page) {
  const $ = cheerio.load(page);
  const $resultsSection = $('.article .findSection').first();
  const $movieList = $resultsSection.find('.findResult .result_text').toArray();

  return $movieList.map(elem =>
    $(elem).contents().not($(elem).children('small')).text().trim()
  );
};
