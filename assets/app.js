/* ReLeaf judging mock — rendering, filtering, drill mode. Vanilla, no deps. */

(function () {
  "use strict";

  var WIKI = "https://timmy97-tw.github.io/releaf-wiki/";

  var TYPES = ["fact", "decision", "boundary", "alternative", "weakness"];

  var T = {
    en: {
      eyebrow: "Judging rehearsal",
      title: "Question bank",
      lede: "Questions a judge can ask about ReLeaf, drawn from what the wiki actually says. Each one carries the answer we can defend, and the page it comes from.",
      m_q: "questions",
      m_s: "sections",
      m_t: "question types",
      search: "Search questions, answers, pages",
      all: "All",
      reviewed: "Reviewed",
      reset: "Clear filters",
      showall: "Open all",
      hideall: "Close all",
      drill: "Drill",
      exit: "Exit",
      answer: "What we can say",
      trap: "Easy wrong answer",
      source: "Source",
      mark: "Mark reviewed",
      marked: "Reviewed",
      flag: "Needs work",
      reveal: "Show answer",
      next: "Next",
      prev: "Back",
      shuffle: "Shuffle",
      hint: "Space reveals · ← → moves · S shuffles · Esc exits",
      none: "Nothing matches that filter.",
      of: "of",
      types: {
        fact: "Fact check",
        decision: "Decision check",
        boundary: "Boundary probe",
        alternative: "Alternative probe",
        weakness: "Weakness probe"
      },
      typedesc: {
        fact: "A number, name, date or method straight off the page.",
        decision: "Why we chose this, and on what evidence.",
        boundary: "Where the claim stops holding.",
        alternative: "The route we did not take, and why.",
        weakness: "The soft spot a judge will find first."
      },
      footer: [
        "Built from the ReLeaf wiki as it stood on 3 October 2026. Model answers quote the wiki; where the wiki says an experiment has not been run, the answer says so.",
        "Rehearsal material for GEMS Taiwan, iGEM 2026. Not part of the judged wiki."
      ]
    },
    zh: {
      eyebrow: "評審演練",
      title: "問題題庫",
      lede: "評審可能針對 ReLeaf 提出的問題，全部依據 wiki 上現有的內容整理。每題附上我們站得住腳的回答，以及出處頁面。",
      m_q: "題",
      m_s: "主題",
      m_t: "題型",
      search: "搜尋問題、回答或頁面",
      all: "全部",
      reviewed: "已練過",
      reset: "清除篩選",
      showall: "全部展開",
      hideall: "全部收合",
      drill: "抽題練習",
      exit: "結束",
      answer: "我們可以這樣回答",
      trap: "最容易答錯的方向",
      source: "出處",
      mark: "標記已練過",
      marked: "已練過",
      flag: "待補強",
      reveal: "顯示回答",
      next: "下一題",
      prev: "上一題",
      shuffle: "重新洗牌",
      hint: "空白鍵顯示回答 · ← → 換題 · S 洗牌 · Esc 結束",
      none: "沒有符合條件的題目。",
      of: "／",
      types: {
        fact: "事實確認",
        decision: "決策確認",
        boundary: "邊界探問",
        alternative: "替代方案探問",
        weakness: "弱點探問"
      },
      typedesc: {
        fact: "頁面上寫明的數字、名稱、日期或方法。",
        decision: "為什麼這樣選，依據什麼證據。",
        boundary: "這個結論到哪裡就不成立。",
        alternative: "我們沒有走的路，以及原因。",
        weakness: "評審最先會戳的地方。"
      },
      footer: [
        "依 2026 年 10 月 3 日的 ReLeaf wiki 內容整理。回答都引用 wiki；若 wiki 本身寫明某項實驗尚未進行，回答就照實說明。",
        "GEMS Taiwan iGEM 2026 內部演練用，不屬於送審的 wiki。"
      ]
    }
  };

  var state = {
    lang: localStorage.getItem("jm.lang") || "en",
    type: "all",
    sec: "all",
    q: "",
    onlyOpen: false,
    done: load("jm.done"),
    flag: load("jm.flag")
  };

  function load(k) {
    try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch (e) { return {}; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function t() { return T[state.lang]; }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function pick(o, key) {
    if (state.lang === "zh" && o[key + "_zh"]) return o[key + "_zh"];
    return o[key] || "";
  }

  var ICON = {
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 9v5"/><circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none"/><path d="M12 3.5 1.8 20.5h20.4z"/></svg>',
    leaf: '<svg class="leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 4C9 4 4 9.5 4 15.5c0 2 .6 3.5.6 3.5"/><path d="M20 4c0 9-5.5 13-15 14.5"/></svg>'
  };

  var all = [];
  QB.sections.forEach(function (s) {
    s.questions.forEach(function (q) { q._sec = s; all.push(q); });
  });

  /* ---------------- shell ---------------- */

  function cite(q) {
    var box = el("span", "q-cite");
    box.appendChild(document.createTextNode(t().source + ": "));
    (q.cite || []).forEach(function (p, i) {
      if (i) box.appendChild(document.createTextNode(", "));
      var a = el("a", null, p);
      a.href = WIKI + p.replace(/^\//, "");
      a.target = "_blank";
      a.rel = "noreferrer";
      box.appendChild(a);
    });
    return box;
  }

  function tagEl(type) {
    var n = el("span", "tag", t().types[type]);
    n.style.color = "var(--t-" + type + ")";
    return n;
  }

  function card(q) {
    var wrap = el("div", "q");
    wrap.id = "q-" + q.id;
    wrap.dataset.open = "0";
    if (state.done[q.id]) wrap.dataset.done = "1";
    if (state.flag[q.id]) wrap.dataset.flag = "1";

    var head = el("button", "q-head");
    head.setAttribute("aria-expanded", "false");
    head.appendChild(el("span", "q-id", q.id));
    var body = el("div", "q-body");
    body.appendChild(el("div", "q-text", pick(q, "q")));
    var tags = el("div", "q-tags");
    tags.appendChild(tagEl(q.type));
    tags.appendChild(cite(q));
    body.appendChild(tags);
    head.appendChild(body);
    head.insertAdjacentHTML("beforeend", ICON.chev);
    wrap.appendChild(head);

    var ans = el("div", "q-ans");
    ans.appendChild(el("div", "ans-label", t().answer));
    ans.appendChild(el("div", "ans-text", pick(q, "answer")));
    if (pick(q, "trap")) {
      var tr = el("div", "trap");
      tr.insertAdjacentHTML("beforeend", ICON.warn);
      var sp = el("span");
      sp.appendChild(el("b", null, t().trap + ": "));
      sp.appendChild(document.createTextNode(pick(q, "trap")));
      tr.appendChild(sp);
      ans.appendChild(tr);
    }
    var foot = el("div", "q-foot");
    var mk = el("button", "mini", state.done[q.id] ? t().marked : t().mark);
    mk.setAttribute("aria-pressed", state.done[q.id] ? "true" : "false");
    mk.addEventListener("click", function () {
      if (state.done[q.id]) delete state.done[q.id]; else state.done[q.id] = 1;
      save("jm.done", state.done);
      wrap.dataset.done = state.done[q.id] ? "1" : "0";
      mk.setAttribute("aria-pressed", state.done[q.id] ? "true" : "false");
      mk.textContent = state.done[q.id] ? t().marked : t().mark;
      counts();
    });
    var fl = el("button", "mini flag", t().flag);
    fl.setAttribute("aria-pressed", state.flag[q.id] ? "true" : "false");
    fl.addEventListener("click", function () {
      if (state.flag[q.id]) delete state.flag[q.id]; else state.flag[q.id] = 1;
      save("jm.flag", state.flag);
      wrap.dataset.flag = state.flag[q.id] ? "1" : "0";
      fl.setAttribute("aria-pressed", state.flag[q.id] ? "true" : "false");
    });
    foot.appendChild(mk);
    foot.appendChild(fl);
    ans.appendChild(foot);
    wrap.appendChild(ans);

    head.addEventListener("click", function () {
      var open = wrap.dataset.open === "1";
      wrap.dataset.open = open ? "0" : "1";
      head.setAttribute("aria-expanded", open ? "false" : "true");
    });
    return wrap;
  }

  function match(q) {
    if (state.type !== "all" && q.type !== state.type) return false;
    if (state.sec !== "all" && q._sec.slug !== state.sec) return false;
    if (state.q) {
      var hay = [pick(q, "q"), pick(q, "answer"), pick(q, "trap"), q.id, (q.cite || []).join(" ")]
        .join(" ").toLowerCase();
      if (hay.indexOf(state.q) < 0) return false;
    }
    return true;
  }

  function render() {
    var host = document.getElementById("sections");
    host.innerHTML = "";
    var shown = 0;
    QB.sections.forEach(function (s) {
      var qs = s.questions.filter(match);
      if (!qs.length) return;
      shown += qs.length;
      var sec = el("section", "sec");
      sec.id = s.slug;
      var h = el("div", "sec-head");
      h.appendChild(el("h2", null, pick(s, "title")));
      h.appendChild(el("p", null, pick(s, "blurb")));
      h.appendChild(el("span", "n", qs.length !== s.questions.length
        ? qs.length + " / " + s.questions.length + " " + t().m_q
        : qs.length + " " + t().m_q));
      sec.appendChild(h);
      qs.forEach(function (q) { sec.appendChild(card(q)); });
      host.appendChild(sec);
    });
    if (!shown) host.appendChild(el("div", "empty", t().none));
    document.getElementById("count").textContent = shown + " " + t().m_q;
    counts();
  }

  function counts() {
    var done = 0;
    all.forEach(function (q) { if (state.done[q.id]) done++; });
    document.getElementById("progress").textContent =
      done + " / " + all.length + " " + t().reviewed.toLowerCase();
    document.querySelectorAll(".rail a[data-sec]").forEach(function (a) {
      var slug = a.dataset.sec;
      var list = slug === "all" ? all : all.filter(function (q) { return q._sec.slug === slug; });
      var d = list.filter(function (q) { return state.done[q.id]; }).length;
      var e = a.querySelector("em");
      if (e) e.textContent = d + "/" + list.length;
    });
  }

  /* ---------------- chrome ---------------- */

  function buildChrome() {
    var L = t();
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    document.body.dataset.lang = state.lang;
    document.title = (state.lang === "zh" ? "評審演練題庫" : "Judging mock question bank") +
      " · ReLeaf";

    document.querySelector(".mark .sub").textContent =
      state.lang === "zh" ? "GEMS Taiwan · iGEM 2026" : "GEMS Taiwan · iGEM 2026";
    document.querySelector(".eyebrow").textContent = L.eyebrow;
    document.querySelector(".hero h1").textContent = L.title;
    document.querySelector(".lede").textContent = L.lede;
    document.getElementById("m-q").nextElementSibling.textContent = L.m_q;
    document.getElementById("m-s").nextElementSibling.textContent = L.m_s;
    document.getElementById("m-t").nextElementSibling.textContent = L.m_t;
    document.getElementById("m-q").textContent = all.length;
    document.getElementById("m-s").textContent = QB.sections.length;
    document.getElementById("m-t").textContent = TYPES.length;

    var keys = document.getElementById("keys");
    keys.innerHTML = "";
    TYPES.forEach(function (ty) {
      var k = el("div", "key");
      var b = el("b");
      var i = el("i");
      i.style.background = "var(--t-" + ty + ")";
      b.appendChild(i);
      b.appendChild(document.createTextNode(L.types[ty]));
      k.appendChild(b);
      k.appendChild(el("span", null, L.typedesc[ty]));
      keys.appendChild(k);
    });

    var inp = document.getElementById("search");
    inp.placeholder = L.search;

    var chips = document.getElementById("chips");
    chips.innerHTML = "";
    [["all", L.all]].concat(TYPES.map(function (ty) { return [ty, L.types[ty]]; }))
      .forEach(function (pair) {
        var c = el("button", "chip");
        c.setAttribute("aria-pressed", state.type === pair[0] ? "true" : "false");
        if (pair[0] !== "all") {
          var i = el("i");
          i.style.background = "var(--t-" + pair[0] + ")";
          c.appendChild(i);
        }
        c.appendChild(document.createTextNode(pair[1]));
        c.addEventListener("click", function () {
          state.type = pair[0];
          buildChrome();
          render();
        });
        chips.appendChild(c);
      });

    document.getElementById("toggle-all").textContent = state.onlyOpen ? L.hideall : L.showall;
    document.getElementById("drill-open").textContent = L.drill;

    var rail = document.getElementById("rail");
    rail.innerHTML = "";
    rail.appendChild(el("h4", null, L.m_s));
    var a0 = el("a");
    a0.href = "#top";
    a0.dataset.sec = "all";
    a0.className = state.sec === "all" ? "on" : "";
    a0.appendChild(document.createTextNode(L.all));
    a0.appendChild(el("em"));
    a0.addEventListener("click", function (e) {
      e.preventDefault();
      state.sec = "all";
      buildChrome();
      render();
    });
    rail.appendChild(a0);
    QB.sections.forEach(function (s) {
      var a = el("a");
      a.href = "#" + s.slug;
      a.dataset.sec = s.slug;
      a.className = state.sec === s.slug ? "on" : "";
      a.appendChild(document.createTextNode(pick(s, "title")));
      a.appendChild(el("em"));
      a.addEventListener("click", function (e) {
        if (state.sec === s.slug) { state.sec = "all"; }
        else { state.sec = s.slug; }
        e.preventDefault();
        buildChrome();
        render();
        if (state.sec !== "all") {
          var n = document.getElementById(s.slug);
          if (n) n.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      rail.appendChild(a);
    });
    var rs = el("button", "ghost reset", L.reset);
    rs.addEventListener("click", function () {
      state.type = "all"; state.sec = "all"; state.q = "";
      document.getElementById("search").value = "";
      buildChrome(); render();
    });
    rail.appendChild(rs);

    var foot = document.getElementById("foot");
    foot.innerHTML = "";
    L.footer.forEach(function (line) { foot.appendChild(el("p", null, line)); });

    moveThumb();
  }

  function moveThumb() {
    var seg = document.getElementById("lang");
    var btns = seg.querySelectorAll("button");
    var on = state.lang === "zh" ? btns[1] : btns[0];
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", b === on ? "true" : "false");
    });
    var thumb = seg.querySelector(".thumb");
    thumb.style.width = on.offsetWidth + "px";
    thumb.style.transform = "translateX(" + (on.offsetLeft - 2) + "px)";
  }

  /* ---------------- drill ---------------- */

  var drill = { list: [], i: 0 };

  function drillStart() {
    drill.list = all.filter(match);
    if (!drill.list.length) return;
    shuffle(drill.list);
    drill.i = 0;
    document.getElementById("drill").dataset.on = "1";
    drillPaint();
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
  }
  function drillPaint() {
    var L = t(), d = document.getElementById("drill"), q = drill.list[drill.i];
    d.dataset.reveal = "0";
    d.querySelector(".drill-bar .count").textContent =
      (drill.i + 1) + " " + L.of + " " + drill.list.length;
    var stage = d.querySelector(".drill-stage");
    stage.innerHTML = "";
    stage.appendChild(tagEl(q.type));
    stage.appendChild(el("div", "drill-q", pick(q, "q")));
    var c = el("div", "drill-cite");
    c.appendChild(document.createTextNode(q.id + " · "));
    c.appendChild(cite(q));
    stage.appendChild(c);
    var a = el("div", "drill-a");
    a.appendChild(el("div", "ans-label", L.answer));
    a.appendChild(el("div", "ans-text", pick(q, "answer")));
    if (pick(q, "trap")) {
      var tr = el("div", "trap");
      tr.insertAdjacentHTML("beforeend", ICON.warn);
      var sp = el("span");
      sp.appendChild(el("b", null, L.trap + ": "));
      sp.appendChild(document.createTextNode(pick(q, "trap")));
      tr.appendChild(sp);
      a.appendChild(tr);
    }
    stage.appendChild(a);
    d.querySelector("#drill-reveal").textContent = L.reveal;
    d.querySelector("#drill-next").textContent = L.next;
    d.querySelector("#drill-prev").textContent = L.prev;
    d.querySelector("#drill-shuffle").textContent = L.shuffle;
    d.querySelector("#drill-exit").textContent = L.exit;
    d.querySelector(".drill-hint").textContent = L.hint;
  }
  function drillMove(n) {
    if (!drill.list.length) return;
    drill.i = (drill.i + n + drill.list.length) % drill.list.length;
    drillPaint();
  }
  function drillEnd() { document.getElementById("drill").dataset.on = "0"; }

  /* ---------------- wire up ---------------- */

  document.addEventListener("DOMContentLoaded", function () {
    var seg = document.getElementById("lang");
    seg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        state.lang = b.dataset.lang;
        localStorage.setItem("jm.lang", state.lang);
        buildChrome();
        render();
        if (document.getElementById("drill").dataset.on === "1") drillPaint();
      });
    });

    document.getElementById("search").addEventListener("input", function (e) {
      state.q = e.target.value.trim().toLowerCase();
      render();
    });

    document.getElementById("toggle-all").addEventListener("click", function () {
      state.onlyOpen = !state.onlyOpen;
      document.querySelectorAll(".q").forEach(function (n) {
        n.dataset.open = state.onlyOpen ? "1" : "0";
        n.querySelector(".q-head").setAttribute("aria-expanded", state.onlyOpen ? "true" : "false");
      });
      document.getElementById("toggle-all").textContent = state.onlyOpen ? t().hideall : t().showall;
    });

    document.getElementById("drill-open").addEventListener("click", drillStart);
    document.getElementById("drill-exit").addEventListener("click", drillEnd);
    document.getElementById("drill-reveal").addEventListener("click", function () {
      document.getElementById("drill").dataset.reveal = "1";
    });
    document.getElementById("drill-next").addEventListener("click", function () { drillMove(1); });
    document.getElementById("drill-prev").addEventListener("click", function () { drillMove(-1); });
    document.getElementById("drill-shuffle").addEventListener("click", function () {
      shuffle(drill.list); drill.i = 0; drillPaint();
    });

    document.addEventListener("keydown", function (e) {
      if (document.getElementById("drill").dataset.on !== "1") return;
      if (e.key === "Escape") drillEnd();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        document.getElementById("drill").dataset.reveal = "1";
      } else if (e.key === "ArrowRight") drillMove(1);
      else if (e.key === "ArrowLeft") drillMove(-1);
      else if (e.key === "s" || e.key === "S") { shuffle(drill.list); drill.i = 0; drillPaint(); }
    });

    window.addEventListener("resize", moveThumb);

    buildChrome();
    render();
  });
})();
