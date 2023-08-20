const isValidUrl = require("is-valid-http-url");
const cheerio = require('cheerio');
const got = (...args) => import('got').then(({ default: got }) => got(...args));

exports.emailScrapper = async (req, res) => {
  const { body } = req;
  let urlArray = body.urls || [];
  let isSingle = body.isSingle || false;
  let isFromCsv = body.isFromCsv || false;
  let emails = [];

  try {
    for (let i = 0; i < urlArray.length; i++) {
      const baseUrl = urlArray[i];
      let results = await extractLinks(baseUrl, isFromCsv, isSingle);
      results.emails.forEach(em => {
        emails.push(em);
      });
      if(!isSingle){
        for (let i = 0; i < results.links.length; i++) {
          const element = results.links[i].href;
          let resultz = await extractLinks(element, isFromCsv, isSingle);
          resultz.emails.forEach(em => {
            emails.push(em);
          });
        }
      }
      
    }
    res.status(200).json({ emails });

  } catch (e) {
    res.status(200).json({ emails: [], error: e });
  }
}





const extractLinks = async (url, isFromCsv, isSingle) => {
  let baseurl = extractBaseUrl(url);

  try {
    // Fetching HTML
    const response = await got(url);
    const html = response.body;
    let regxz = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

    // Using cheerio to extract <a> tags
    const $ = cheerio.load(html);

    //extracting body html and finding emails using regx
    const bodyItem = $('body');
    let htmlPages = $.html(bodyItem).toString();

    //extract all available emails on that page
    let foundedEmails = htmlPages.match(regxz);

    let emailObj = [];
    let unickEmails = {};
    if (foundedEmails) {
      foundedEmails.forEach(em => {
        //wheather it is a file or actual email
        let emaillPart = em.toLowerCase().split(".");
        let fileExtention = emaillPart[emaillPart.length - 1]
        let fileExtentions = ["jpg", "jpeg", "png", "webp"];

        if (fileExtentions.indexOf(fileExtention) == -1) {
          //here validating duplicate emails
          let sanitizedEmail = sanitizeEmail(em);
          if (!unickEmails[sanitizedEmail]) {
            emailObj.push({ url: url, email: sanitizedEmail })
            unickEmails[sanitizedEmail] = 1;
          }
        }
      });
    }

    const links = [];
    //isSingle = true => pageSearch
    //isSingle = false => webSearch
    if (!isSingle) {
      //extracting all anchor links here
      const linkObjects = $('a');
      linkObjects.each((index, element) => {
        try {
          let anchorLink = $(element).attr('href');
          if (anchorLink)

            if (anchorLink.startsWith("/") && !(anchorLink == "/")) {
              let actualUrl = baseurl + anchorLink;
              if (isValidUrl(actualUrl)) {
                links.push({
                  href: actualUrl,
                });
              }
            } else if (anchorLink.startsWith(url) && anchorLink != url) {
              links.push({
                href: anchorLink,
              });
            }
        } catch (error) { }
      });
    }
    if(isSingle && isFromCsv && emailObj.length==0){
      emailObj.push({ url: url, email: [] });
    }

    return { links, emails: emailObj };
  } catch (error) {
    return { links: [], emails: [], error: error };
  }
};

function sanitizeEmail(email) {
  if (email.endsWith(".")) {
    return email.slice(0, -1);
  }
  return email;
}

function extractBaseUrl(url) {
  var pathArray = url.split('/');
  var protocol = pathArray[0];
  var host = pathArray[2];
  var baseurl = protocol + '//' + host;
  return baseurl;
}