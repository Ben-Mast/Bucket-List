# Interactive Bucket List

A lightweight bucket-list frontend built with plain HTML, CSS, and vanilla JavaScript. The list is completely hidden until one of two trusted users enters the shared numeric access code. Once unlocked, items and their category, location, and weather tags can be managed, searched, and filtered. Supabase authentication and Row Level Security protect the underlying records.

## Project structure

```text
.
├── index.html            # Page markup and Supabase CDN script
├── manifest.webmanifest  # Home-screen and installed-app metadata
├── sw.js                 # App-shell cache and offline fallback
├── icons/                # Browser and home-screen icons
├── css/
│   └── styles.css        # Responsive visual styles
├── js/
│   ├── app.js            # UI state and interactions
│   └── supabase.js       # Supabase client and future data operations
└── supabase/
    └── README.md         # Placeholder for future CLI configuration/migrations
```

## Run locally

Because the JavaScript uses ES modules, serve the repository through a small local web server rather than opening `index.html` directly. For example, if Python is installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser. No package installation or build step is required.

The relative asset paths also work when GitHub Pages hosts the site from the repository root.

## Install on a phone

The site is a Progressive Web App. After it has been deployed over HTTPS (including with GitHub Pages), install it from the browser:

- On iPhone or iPad, open it in Safari, choose **Share**, then **Add to Home Screen**, and leave **Open as Web App** enabled.
- On Android, open the browser menu and choose **Install app** or **Add to Home screen**.

The service worker caches only the application shell (HTML, CSS, JavaScript, and icons). Authentication and bucket-list data are not cached and still require a connection to Supabase. When testing service-worker changes locally, refresh once after the new worker activates or close and reopen the installed app.

## Configure Supabase

In `js/supabase.js`, replace these placeholders with the public values from your Supabase project's API settings:

- `SUPABASE_URL`: the project URL, such as `https://your-project.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`: the browser-safe publishable key

Never place a Supabase service-role or secret key in this frontend repository. Database operations can be added to `js/supabase.js` after the project schema is designed.

