# piano

A very cool vanilla js piano that only works on Chrome.

Like many of my projects, there is a full stack version with a Rails API that allows you to save and retrieve songs, as well as a front-end only version that shares songs via encoded URL.

The piano is mobile responsive, although iOS does not allow the native JS sound API ;_;

Some neat coding tricks incorporated here include a monkey-patched sound API that let's us record the length of notes and the ability to store songs as objects, play them back, and share them via URL.

You can check out the front-end only version at [pianofriend.cool](pianofriend.cool)
