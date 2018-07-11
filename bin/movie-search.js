#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const Ora = require('ora');

const spinner = new Ora({
  text: 'Loading movie titles',
  color: 'yellow'
});

const [movieName] = process.argv.slice(2);

if (!movieName) {
  console.log('Please provide Title.');
  process.exit(1);
}

const URL = makeUrl(movieName);

imdbSearch(URL)
  .then(pageParser)
  .then(logMovies)
  .catch(logError);

function makeUrl(query) {
  return `https://www.imdb.com/find?ref_=nv_sr_fn&q=${query}&s=all`;
}

function logMovies(movies) {
  if (movies && movies.length > 0) {
    spinner.stop();
    movies.forEach(movie => console.log(movie));
    return;
  }
  console.log(`No results found for: "${movieName}"`);
}

function logError(err) {
  spinner.fail();
  console.log(err.message);
  process.exit(1);
}

function imdbSearch(url) {
  spinner.start();
  return axios.get(url).then(response => response.data);
}

function pageParser(page) {
  const $ = cheerio.load(page);
  const $resultsSection = $('.article .findSection').first();
  const $movieList = $resultsSection.find('.findResult .result_text').toArray();

  return $movieList.map(elem =>
    $(elem)
      .contents()
      .not($(elem).children('small'))
      .text()
      .trim()
  );
}
