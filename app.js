(() => {
  const { lessons } = window.GRAMMAR_UNIT_DATA;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const sharedAudio = new Audio();
  const timings = window.GRAMMAR_AUDIO_TIMINGS ?? {};
  let lessonIndex = 0;

  $("#lessonTotal").textContent = String(lessons.length);

  function stopAudio() {
    sharedAudio.pause();
    sharedAudio.currentTime = 0;
    sharedAudio.ontimeupdate = null;
    sharedAudio.onended = null;
    sharedAudio.onerror = null;
    $$("#lessonExample span").forEach((word) =>
      word.classList.remove("is-speaking"),
    );
    $("#playLesson").innerHTML =
      '<span aria-hidden="true">▶</span> Nghe câu mẫu tiếng Anh';
  }

  function renderKaraoke(sentence) {
    $("#lessonExample").replaceChildren(
      ...sentence.split(/\s+/).map((text) => {
        const word = document.createElement("span");
        word.textContent = text;
        return word;
      }),
    );
  }

  function updateKaraoke(audioId) {
    const boundaries = timings[audioId] ?? [];
    const words = $$("#lessonExample span");
    let active = -1;
    boundaries.forEach((boundary, index) => {
      if (sharedAudio.currentTime >= boundary.start) active = index;
    });
    words.forEach((word, index) => {
      word.classList.toggle("is-speaking", index === active);
    });
  }

  function playLesson() {
    stopAudio();
    const lesson = lessons[lessonIndex];
    sharedAudio.src = `assets/audio/${lesson.audio}.mp3`;
    $("#playLesson").textContent = "Đang phát câu mẫu...";
    const finish = () => stopAudio();
    sharedAudio.ontimeupdate = () => updateKaraoke(lesson.audio);
    sharedAudio.onended = finish;
    sharedAudio.onerror = finish;
    sharedAudio.play().catch(finish);
  }

  function renderDots() {
    $("#lessonDots").replaceChildren(
      ...lessons.map((_, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(index + 1);
        button.classList.toggle("is-active", index === lessonIndex);
        button.setAttribute("aria-label", `Mở phần ${index + 1}`);
        button.addEventListener("click", () => {
          lessonIndex = index;
          renderLesson();
        });
        return button;
      }),
    );
  }

  function formulaRow(parts) {
    const row = document.createElement("div");
    row.className = "formula-row";
    parts.forEach((part, index) => {
      const span = document.createElement("span");
      span.textContent = part;
      if (index === 0) span.className = "subject";
      if (/be|am|is|are|was|were|will|can|could|may|might|have|has|do|does|did/i.test(part)) {
        span.className = "verb";
      }
      if (/noun|verb|adjective|adverb|preposition|subject|object/i.test(part)) {
        span.className = "detail";
      }
      row.append(span);
    });
    return row;
  }

  function renderLesson() {
    stopAudio();
    const lesson = lessons[lessonIndex];
    $("#lessonNumber").textContent = String(lessonIndex + 1);
    $("#lessonProgress").style.width =
      `${((lessonIndex + 1) / lessons.length) * 100}%`;
    $("#lessonVisual").src = `assets/images/${lesson.image}.webp`;
    $("#lessonVisual").alt = lesson.label;
    $("#visualLabel").textContent = lesson.label;
    $("#lessonTag").textContent = lesson.tag;
    $("#lessonTitle").textContent = lesson.title;
    $("#lessonNote").textContent = lesson.note;
    $("#lessonFormula").replaceChildren(
      ...lesson.formula.map(formulaRow),
    );
    renderKaraoke(lesson.example);
    renderDots();
  }

  $("#playLesson").addEventListener("click", playLesson);
  $("#previousLesson").addEventListener("click", () => {
    lessonIndex = (lessonIndex - 1 + lessons.length) % lessons.length;
    renderLesson();
  });
  $("#nextLesson").addEventListener("click", () => {
    lessonIndex = (lessonIndex + 1) % lessons.length;
    renderLesson();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") $("#previousLesson").click();
    if (event.key === "ArrowRight") $("#nextLesson").click();
  });

  renderLesson();
})();
