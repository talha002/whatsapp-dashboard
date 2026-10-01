# Stopword sources

The seven `.js` files are unmodified language arrays from
[Stopwords ISO](https://github.com/stopwords-iso/stopwords-iso), revision
`6e8e9a2d1c019ad2a885bcbe157628dea624dfb6`, fetched on 2026-10-01 from
[`stopwords-iso.json`](https://github.com/stopwords-iso/stopwords-iso/blob/6e8e9a2d1c019ad2a885bcbe157628dea624dfb6/stopwords-iso.json).
Only the JSON array wrapper was converted to an ES module export. The MIT license
is retained in `LICENSE` and distributed in `public/stopwords-license.txt`.

These are established language-specific collections, not translations of the
English or Turkish defaults. Upstream per-language repositories document their
individual sources: [ES](https://github.com/stopwords-iso/stopwords-es),
[FR](https://github.com/stopwords-iso/stopwords-fr),
[PT](https://github.com/stopwords-iso/stopwords-pt),
[DE](https://github.com/stopwords-iso/stopwords-de),
[IT](https://github.com/stopwords-iso/stopwords-it),
[PL](https://github.com/stopwords-iso/stopwords-pl),
[RO](https://github.com/stopwords-iso/stopwords-ro).

## Chat additions

`shared/text.js` keeps separately curated, finite chat lists. They include
greetings, acknowledgments, laughter and informal abbreviations used in each
language. Reference examples:

- Spanish: `jaja`, `jeje`, `tqm` — [jaja](https://en.wiktionary.org/wiki/jaja), [tqm](https://en.wiktionary.org/wiki/tqm).
- French: `mdr`, `ptdr`, `stp`, `tkt` — [native French mdr entry](https://fr.wiktionary.org/wiki/mdr) and [tkt](https://fr.wiktionary.org/wiki/tkt).
- Portuguese: `rs`, `rsrs`, `kkkk`, `vc`, `vlw` — [rs](https://en.wiktionary.org/wiki/rs#Portuguese) and [Portuguese internet usage](https://pt.wikipedia.org/wiki/Internet%C3%AAs). Brazilian chat forms are included alongside the general Portuguese list.
- German: `digga`, `lg`, `mfg`, `hdl` — [Duden: Digga](https://www.duden.de/rechtschreibung/Digga) and [hdl](https://de.wiktionary.org/wiki/hdl).
- Italian: `tvb`, `cmq`, `xke` — [Treccani: Abbreviazioni](https://www.treccani.it/enciclopedia/abbreviazioni_%28Enciclopedia-dell%27Italiano%29/) and [electronic language](https://www.treccani.it/magazine/lingua_italiana/speciali/lingua_spedita/Cortelazzo.html).
- Polish: `no`, `xd`, `spoko`, `pzdr` — [WSJP: spoko](https://wsjp.pl/haslo/podglad/79044/spoko), [XD](https://pl.wiktionary.org/wiki/XD), [study of youth language](https://bazhum.muzhp.pl/media/texts/jezyk-szkoa-religia/2008-tom-3/jezyk_szkola_religia-r2008-t3-s365-370.pdf).
- Romanian: `ms`, `mersi`, `sal`, `cf`, `bn`, `nb`, `pwp` — [ms](https://en.wiktionary.org/wiki/ms#Romanian) and [mersi](https://dexonline.ro/definitie/mersi/definitii).

These lists are editorial defaults, not a claim that every speaker uses every
form. Users can remove any default or add their own words for each language.
No dictionary definitions or example sentences are copied into the lists.

## Normalization and scope

Uploaded documents carry their analysis language through both WhatsApp parsing
and plain-text fallback. Each document uses only its own stopwords, including
when several documents are displayed together. Global excluded words are
normalized separately for each document language. Changing the interface
language does not change an existing document's analysis language.

Unicode NFC and language-specific lowercasing preserve accents and Turkish
`I/ı` and `İ/i`. Romanian legacy `ş/ţ` and modern `ș/ț` are treated equivalently
in both tokens and stopwords. The tokenizer uses Unicode letters; punctuation
splits tokens, and one-letter tokens are discarded as before. Source entries
containing punctuation or multiple words remain in the editable lists but do
not match whole phrases: filtering uses exact individual tokens.

Untagged legacy `chat-data.json` datasets retain the previous combined EN/TR
filter and Turkish casing because no document language is available. The demo
chat remains Turkish for the Turkish UI and English for other UI languages,
with the correct document language tag.
