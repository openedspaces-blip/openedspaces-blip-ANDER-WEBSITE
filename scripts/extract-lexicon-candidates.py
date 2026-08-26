#!/usr/bin/env python3
"""Build frequency-ranked adjective/adverb candidates from Kaikki + Tatoeba."""
import bz2
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

TEMP_DIR = Path(os.environ.get("TEMP", ".")) / "andergo-lexicon-build"
sys.path.insert(0, str(TEMP_DIR / "pydeps"))
from wordfreq import top_n_list, zipf_frequency  # noqa: E402

LANGUAGES = {
    "english": ("en", "eng"), "spanish": ("es", "spa"),
    "french": ("fr", "fra"), "italian": ("it", "ita"),
    "portuguese": ("pt", "por"), "german": ("de", "deu"),
}
TARGETS = {"english": 500, "spanish": 500, "french": 500, "italian": 500, "portuguese": 500, "german": 200}
BLACKLIST = {
    "archaic", "obsolete", "rare", "dated", "historical", "offensive",
    "vulgar", "nonstandard", "dialectal", "misspelling", "internet",
    "humorous", "eye-dialect", "pronunciation-spelling",
}
WORD_RE = re.compile(r"[^\W\d_]+(?:[-'’][^\W\d_]+)*", re.UNICODE)


def norm(value):
    return " ".join(unicodedata.normalize("NFKC", value or "").strip().casefold().split())


def clean_sentence(text):
    text = unicodedata.normalize("NFKC", text or "").strip()
    if not 12 <= len(text) <= 125 or "�" in text or "http" in text.lower():
        return None
    if sum(ch.isalpha() for ch in text) < 7 or text.count("{") or text.count("["):
        return None
    words = WORD_RE.findall(text)
    return text if 3 <= len(words) <= 20 else None


def usable_entry(entry):
    word = unicodedata.normalize("NFKC", entry.get("word", "")).strip()
    if not word or len(word) > 42 or word != word.lower():
        return False
    # New entries use dictionary headwords only. Existing curated multiword
    # connectors remain available, but excluding phrases here prevents
    # near-identical phrase variants from inflating the requested word count.
    if re.search(r"[\d@#$%^*_={}<>/\\|]", word) or len(word.split()) != 1:
        return False
    senses = entry.get("senses", [])
    lexical_senses = [sense for sense in senses if not sense.get("form_of") and not sense.get("alt_of")]
    if not lexical_senses:
        return False
    tags = {str(tag).casefold() for sense in lexical_senses for tag in sense.get("tags", [])}
    return not tags.intersection(BLACKLIST)


def forms_for(entry, language):
    forms = entry.get("forms", [])
    def first(tag):
        for item in forms:
            tags = {str(value).casefold() for value in item.get("tags", [])}
            if tag in tags and not tags.intersection(BLACKLIST):
                form = unicodedata.normalize("NFKC", item.get("form", "")).strip()
                if form and form not in {"-", "—"}: return form
        return None
    word = entry["word"]
    comparative, superlative = first("comparative"), first("superlative")
    if language == "english":
        comparative = comparative or f"more {word}"
        superlative = superlative or f"the most {word}"
    elif language == "spanish":
        comparative, superlative = f"más {word}", f"el/la más {word}"
    elif language == "french":
        comparative, superlative = f"plus {word}", f"le/la plus {word}"
    elif language == "italian":
        comparative, superlative = f"più {word}", f"il/la più {word}"
    elif language == "portuguese":
        comparative, superlative = f"mais {word}", f"o/a mais {word}"
    else:
        comparative = comparative or f"mehr {word}"
        superlative = superlative or f"am meisten {word}"
    return comparative, superlative


def antonym_for(entry):
    for sense in entry.get("senses", []):
        for antonym in sense.get("antonyms", []):
            word = antonym.get("word", "").strip()
            if word: return word
    return "sin antónimo directo"


def infer_adverb_category(entry):
    gloss = " ".join(
        str(gloss).casefold() for sense in entry.get("senses", [])
        for gloss in sense.get("glosses", [])
    )
    rules = [
        ("frecuencia", ("frequency", "habitually", "usually", "often", "always", "never", "sometimes")),
        ("lugar", ("place", "location", "direction", "where", "spatial", "nearby", "abroad")),
        ("tiempo", ("time", "temporal", "formerly", "soon", "today", "yesterday", "now", "later")),
        ("cantidad", ("degree", "extent", "quantity", "intensifier", "amount")),
        ("duda", ("perhaps", "maybe", "possibility", "probably", "uncertain")),
        ("afirmación", ("affirmation", "certainly", "definitely", "indeed")),
        ("conector", ("conjunctive", "sentence adverb", "therefore", "however", "nevertheless", "consequently")),
    ]
    for category, needles in rules:
        if any(needle in gloss for needle in needles): return category
    return "modo"


def read_candidates(language, kind, excluded):
    code, _ = LANGUAGES[language]
    frequent_words = {norm(word) for word in top_n_list(code, 100000)}
    path = TEMP_DIR / f"{language}-{kind}.jsonl"
    by_word = {}
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            entry = json.loads(line)
            if norm(entry.get("word", "")) not in frequent_words: continue
            if not usable_entry(entry): continue
            key = norm(entry["word"])
            if key in excluded: continue
            score = zipf_frequency(entry["word"], code)
            if score < 2.0: continue
            examples = []
            for sense in entry.get("senses", []):
                for example in sense.get("examples", []):
                    sentence = clean_sentence(example.get("text", ""))
                    if sentence and norm(sentence) not in {norm(value) for value in examples}:
                        examples.append(sentence)
            current = by_word.get(key)
            if current is None or score > current["score"]:
                row = {"word": entry["word"], "score": score, "examples": examples[:2]}
                if kind == "adj":
                    row["comparative"], row["superlative"] = forms_for(entry, language)
                    row["antonym"] = antonym_for(entry)
                else:
                    row["category"] = infer_adverb_category(entry)
                by_word[key] = row
            elif examples:
                for sentence in examples:
                    if norm(sentence) not in {norm(value) for value in current["examples"]}:
                        current["examples"].append(sentence)
                current["examples"] = current["examples"][:2]
    return sorted(by_word.values(), key=lambda row: (-row["score"], norm(row["word"])))[:5000]


def add_tatoeba_examples(candidates, language):
    _, tatoeba_code = LANGUAGES[language]
    by_token = {}
    for row in candidates:
        key = norm(row["word"])
        by_token.setdefault(key, []).append(row)
    source = TEMP_DIR / f"{tatoeba_code}-sentences.tsv.bz2"
    with bz2.open(source, mode="rt", encoding="utf-8") as stream:
        for line in stream:
            parts = line.rstrip("\n").split("\t", 2)
            if len(parts) != 3: continue
            sentence = clean_sentence(parts[2])
            if not sentence: continue
            sentence_norm = norm(sentence)
            matches = {norm(token) for token in WORD_RE.findall(sentence)}.intersection(by_token)
            for match in matches:
                for row in by_token[match]:
                    if len(row["examples"]) < 2 and sentence_norm not in {norm(value) for value in row["examples"]}:
                        row["examples"].append(sentence)


def main():
    exclusions_path = TEMP_DIR / "lexicon-exclusions.json"
    exclusions = json.loads(exclusions_path.read_text(encoding="utf-8"))
    output = {"adjectives": {}, "adverbs": {}}
    for language in LANGUAGES:
        for kind, group in (("adj", "adjectives"), ("adv", "adverbs")):
            rows = read_candidates(language, kind, set(exclusions[group][language]))
            required = TARGETS[language] - len(exclusions[group][language])
            if sum(len(row["examples"]) >= 2 for row in rows) < required:
                add_tatoeba_examples(rows, language)
            usable = [row for row in rows if len(row["examples"]) >= 2]
            output[group][language] = usable
            print(f"{group}/{language}: {len(usable)} candidates with two examples", flush=True)
    (TEMP_DIR / "lexicon-candidates.json").write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
