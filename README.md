# Bermuda

## What is that?
This is a push-and-play shortener server to use your own domain to shorten URLs.

No database, no storage, no fees, no worries.

As fast and reliable as Google Shortener service (ahem) but with your own domain.

Just push to Heroku and start shortening.

## How do I install it?
Simple.
### 1. Fork this repo
### 2. Tweak configuration, if needed
Configuration file is at the root, `config.js`. It is JS, not JSON, so no formating pressure.

- `apiKey`: optional Google API key to use when shortening. I didn’t find a reason to do so just yet.
- `restrict`: string or RegExp to restrict shortenable URLs. You _may_ not want your shortener to be used to shorten links to NSFW websites.

### 3. Create an app on Heroku and push the code
You sure can use something else than Heroku, but it’s up to you to make it work elsewhere. You don’t need a paid app, a single free dyno will be more than enough.

### 4. Link your custom super-tiny domain to the app
Because short URLs beginning with `http://floral-commotion-7635.herokuapp.com/` are not _that_ short.
HTTP or HTTPS, both are fine. This is actually the only thing you’ll have to pay.

## How do I use it?
So let’s say you installed it and used your domain `short.io`.

You want to shorten `{longUrl}`.

### Shorten
#### Request
```
GET, POST or PUT
http://short.io/{longUrl}
```

or

```
GET, POST or PUT
http://short.io/?longUrl={longUrl}
```

or

```
POST or PUT
http://short.io/
{
  "longUrl": "{longUrl}"
}
```
__YES__, the long URL is URL encoded in the URL or the query. Obviously.

#### Response
```
status: 200
body: "http://short.io/FWWiET"
```

or, if your Accept header begs for JSON:

```
status: 200
Content-Type: application/json
body: { "shortUrl": "http://short.io/FWWiET" }
```

### Expand
#### Request
```
GET, PUT, POST
http://short.io/FWWiET
```

#### Response
```
status: 302
Location: "{longUrl}"
```

So people requesting the shortened URL will be redirected to the final URL. If you want to get the final URL, just don’t follow the redirection.

## How does it work?
It internally uses [Google Shortener API](https://developers.google.com/url-shortener) to shorten and expand URLs. That’s why it’s fast, reliable and free.

When you shorten a URL, it actually creates a `goo.gl` short URL and replaces `http://goo.gl/` with your domain.

When you expand a short URL, it replaces your domain with `http://goo.gl/`, resolves this short URL with Google Shortener API and redirects to the final long URL.

So `goo.gl` URLs are never exposed to users.

## Anything else?
Yes. There is a small lib to use the Google Shortener API itself. You could use just that, without using the bundled server.

## What about tests?
I either wrote tests or this useless README file. That was my fastest decision-taking, ever.

## Why “Bermuda”?
I love bad play on words. This is the worst I could come up with.

## Who gives a shit?
I don’t.
