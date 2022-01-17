#!/usr/bin/env node

// Raycast script to open Twitter URLs in Tweetbot for Mac
// Supports tweets, user profiles, and search URLs
//
// Dependency: This script requires Nodejs.
// Install Node: https://nodejs.org/en/download/
//
// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Open in Tweetbot
// @raycast.mode silent
// @raycast.packageName Tweetbot
// @raycast.argument1 { "type": "text", "placeholder": "Tweet, User, or Search URL"}
//
// Optional parameters:
// @raycast.icon images/icon-tweetbot.tiff
//
// Documentation:
// @raycast.description Open Twitter URLs in Tweetbot for Mac
// @raycast.author Nathan Holm
// @raycast.authorURL https://github.com/holmnathan

// ----------------------------------------------------------------------------
const username = ""; // REQUIRED: Add your Twitter username here
// ----------------------------------------------------------------------------

const { exec } = require("child_process");
const userUrl = process.argv[2];
let tweetbotUrl;
const twitterRegEx = {
  domain: /^https?:(\/\/)?(www|mobile)?\.?twitter\.com\//,
  tweet: /(?<user>[0-9a-zA-Z_]+\/)?status(es)?\/(?<tweetId>\d+)/,
  user: /^[0-9a-zA-Z_]+\/?$/i,
  search: /^search\?q=/,
  arguments: /&.+$/,
};

// Validate a URL
const isValidUrl = (url, regEx, name) => {
  if (typeof url !== "string") {
    throw new TypeError(`Please enter a valid ${name} URL`);
  } else if (!url.match(regEx)) {
    throw new Error(`“${url}” is not a ${name} valid URL`);
  } else {
    return true;
  }
};

function handleTwitterURL(url) {
  const tweetbotUrl = {
    type: "",
    query: "",
  };

  // Leave only URL path
  url = url.replace(twitterRegEx.domain, ""); // Strip domain
  url = url.replace(twitterRegEx.arguments, ""); // Strip arguments
  url = url.replace("#!/", ""); // Fix for old hashbang URLs

  if (url.match(twitterRegEx.tweet)) {
    // Tweet by ID
    tweetbotUrl.type = "status/";
    tweetbotUrl.query = url.replace(twitterRegEx.tweet, "$<tweetId>");
  } else if (url.match(twitterRegEx.user)) {
    // User profile
    tweetbotUrl.type = "user_profile/";
    tweetbotUrl.query = url;
  } else if (url.match(twitterRegEx.search)) {
    // Search query
    tweetbotUrl.type = "search?query=";
    tweetbotUrl.query = url.replace(twitterRegEx.search, "");
  } else {
    throw new ReferenceError(
      "Please enter a valid tweet, user profile, or search query URL"
    );
  }

  return `tweetbot://${username}/${tweetbotUrl.type}${tweetbotUrl.query}`;
}

try {
  isValidUrl(userUrl); // Verify user input is Twitter URL
  tweetbotUrl = handleTwitterURL(userUrl); // Convert to Tweetbot URL
  exec(`open "${tweetbotUrl}"`); // Open URL in Tweetbot
} catch (error) {
  console.error(error.name);
  console.error(error.message);
}
