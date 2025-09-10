import moment from "moment";

import picture from "./src/js/picture.js";

export default async function(eleventyConfig) {

	eleventyConfig.addPassthroughCopy("./src/js/main-min.js");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/style.css");


  // Shortcodes for Pictures
  eleventyConfig.addShortcode("picture", picture);


  //©copyrights year output
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);



  // You can return your Config object (optional).
  return {
    dir: {
      input: "src",
      output: "dist",
      data: "_data"
    }
  };

};