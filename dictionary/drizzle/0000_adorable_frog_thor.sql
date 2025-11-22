CREATE TABLE `dictionary_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `english_term` text NOT NULL,
  `runyoro_term` text NOT NULL,
  `swahili_term` text,
  `examples` text,
  `image` text,
  `audio` text,
  `created_at` integer DEFAULT (unixepoch())
);
-- 1. Create the Virtual Table for Searching
-- We use "content='dictionary_entries'" to tell SQLite:
-- "Don't duplicate the text data, just reference the main table to save space."
CREATE VIRTUAL TABLE dictionary_search USING fts5(
  english_term,
  runyoro_term,
  swahili_term,
  content = 'dictionary_entries',
  content_rowid = 'id',
  tokenize = 'porter ascii'
);
-- 2. Create Triggers to Keep Search Syncronized
-- Trigger: After Insert
CREATE TRIGGER dictionary_entries_ai
AFTER
INSERT ON dictionary_entries BEGIN
INSERT INTO dictionary_search(rowid, english_term, runyoro_term, swahili_term)
VALUES (
    new.id,
    new.english_term,
    new.runyoro_term,
    new.swahili_term
  );
END;
-- Trigger: After Delete
CREATE TRIGGER dictionary_entries_ad
AFTER DELETE ON dictionary_entries BEGIN
INSERT INTO dictionary_search(
    dictionary_search,
    rowid,
    english_term,
    runyoro_term,
    swahili_term
  )
VALUES(
    'delete',
    old.id,
    old.english_term,
    old.runyoro_term,
    old.swahili_term
  );
END;
-- Trigger: After Update
CREATE TRIGGER dictionary_entries_au
AFTER
UPDATE ON dictionary_entries BEGIN
INSERT INTO dictionary_search(
    dictionary_search,
    rowid,
    english_term,
    runyoro_term,
    swahili_term
  )
VALUES(
    'delete',
    old.id,
    old.english_term,
    old.runyoro_term,
    old.swahili_term
  );
INSERT INTO dictionary_search(rowid, english_term, runyoro_term, swahili_term)
VALUES (
    new.id,
    new.english_term,
    new.runyoro_term,
    new.swahili_term
  );
END;