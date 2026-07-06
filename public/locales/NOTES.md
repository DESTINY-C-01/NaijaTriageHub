# Locale Status

Done (fully translated, ready to ship):
- hausa.json
- igbo.json
- yoruba.json

Pending (listed in AVAILABLE_LANGUAGES in src/app/page.js but no file yet -
selecting these currently falls back gracefully to English/Pidgin with a
"could not load this language" notice, thanks to the try/catch in
loadLanguage()):
- fulfulde.json
- kanuri.json
- tiv.json
- ibibio.json

To translate one: copy hausa.json, translate every `text` / `title` /
`steps` value, keep every `id` field and JSON key exactly as-is (the app
reads by `id`, not by translated text). Save as `public/locales/<code>.json`
where `<code>` matches the `code` already used in AVAILABLE_LANGUAGES.

Scaling past these 7: generate AVAILABLE_LANGUAGES from a build-time
`public/locales/manifest.json` list instead of hardcoding it in page.js,
so adding language #8 through #250+ never touches component code - only
adds a JSON file + one manifest entry.