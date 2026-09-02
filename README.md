# Interactive Bucket List

A lightweight bucket-list frontend built with plain HTML, CSS, and vanilla JavaScript. The list is completely hidden until one of two trusted users enters the shared numeric access code. Once unlocked, items and their category, location, and weather tags can be managed, searched, and filtered. Supabase authentication and Row Level Security protect the underlying records.

## Project structure

```text
.
├── index.html            # Page markup and Supabase CDN script
├── css/
│   └── styles.css        # Responsive visual styles
├── js/
│   ├── app.js            # UI state and interactions
│   └── supabase.js       # Supabase client and future data operations
└── supabase/
    └── README.md         # Placeholder for future CLI configuration/migrations
```

