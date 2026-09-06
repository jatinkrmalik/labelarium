# Security

If you find a vulnerability in Labelarium, please do not open a public issue.

Email **hello@labelarium.com**. Include enough to reproduce it (URL or file,
what you did, what you expected, what happened). We will try to reply and say
whether we think it is in scope.

## Scope

Labelarium is a static web app: HTML, CSS, JavaScript and a service worker. In
scope:

- Cross-site scripting (XSS) in the app shell or device data
- Service worker issues (cache poisoning, unexpected network control, stale
  privileged responses)
- Anything that could steal or alter data in a saved-offline install
  (favorites, saved labels)

Out of scope unless it clearly affects the app: manufacturer manuals, bundled
fonts, GitHub Pages or other hosts, and third-party sites we only link to.

## Bounty

There is no bug bounty unless we say otherwise. A thanks and a fix is the
usual outcome.
