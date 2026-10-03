# Judging Mock

A mock-judging question bank for **ReLeaf** (GEMS Taiwan, iGEM 2026, Biomanufacturing
Village). Questions a judge could reasonably ask, with the answer we can defend and the
wiki page it comes from. English and Traditional Chinese, one switch.

Open `index.html`. No build step to read it, no framework, nothing fetched from outside.

## What is in it

Eight areas:

| Area | Prefix |
| --- | --- |
| Plant & Stress Biology | `PS` |
| Protectant Choice and Design | `PD` |
| Gene Circuit & Cloning | `GC` |
| Bioreactor, Hardware & AIoT Software | `HW` |
| Human Practices & Regulation | `HP` |
| Business & Entrepreneurship | `BE` |
| Biomanufacturing | `BM` |
| General Team Questions | `GT` |

Five question types, so a rehearsal does not turn into trivia:

- **Fact check** — a number, name, date or method straight off the page.
- **Decision check** — why we chose this, and on what evidence.
- **Boundary probe** — where the claim stops holding.
- **Alternative probe** — the route we did not take, and why.
- **Weakness probe** — the soft spot a judge will find first.

## Using it

- **Filter** by area, type or free text. The search covers questions, answers and cited pages.
- **Mark reviewed** and **Needs work** are stored in the browser, per device. Nothing is sent anywhere.
- **Drill** takes whatever is on screen after filtering, shuffles it and shows one question at a time. Space reveals the answer, arrow keys move, `S` reshuffles, `Esc` leaves.
- **Print** (⌘P) gives every visible question with its answer opened, for a paper run-through.

## Ground rule for the answers

Every answer is written from the wiki as it stood on 3 October 2026, and cites the page
it came from. Where the wiki says an experiment has not been run, or that a number rests
on one run, the answer says so instead of covering it. That is the point of the weakness
probes: the team should hear those questions here first, not in the room.

If a wiki page changes, change the matching answer.

## Editing

Questions live in `data/sections/<slug>.json`, one file per area. After editing:

```bash
python3 tools/build.py
```

That regenerates `data/questions.js`, checks for duplicate ids, unknown types and empty
translations, and prints the per-area and per-type counts.

Field reference:

```json
{
  "id": "PS-01",
  "type": "fact | decision | boundary | alternative | weakness",
  "q": "question (English)",
  "q_zh": "question (Traditional Chinese)",
  "answer": "model answer (English)",
  "answer_zh": "model answer (Traditional Chinese)",
  "cite": ["plant/", "experiments/"],
  "trap": "the wrong answer someone is likely to give (optional)",
  "trap_zh": "同上（選填）"
}
```

`cite` entries are wiki paths; the page links them to
<https://timmy97-tw.github.io/releaf-wiki/>.

Rehearsal material, not part of the judged wiki.
