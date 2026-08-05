(async function renderDeck() {
  const response = await fetch("./deck-data.json");
  const deck = await response.json();
  document.title = deck.meta?.title || "A4 HTML Slide Deck";
  document.documentElement.style.setProperty("--accent", deck.theme?.accent || "#0F766E");

  const root = document.getElementById("deck");
  root.innerHTML = "";
  deck.slides.forEach((slide, index) => {
    root.appendChild(renderSlide(slide, index + 1, deck.slides.length));
  });
})();

function renderSlide(slide, pageNumber, pageCount) {
  const page = el("section", `page page-${slide.template}`);
  page.dataset.template = slide.template;
  page.dataset.page = String(pageNumber);

  const content = el("div", "page-content");
  content.appendChild(template(slide));
  page.appendChild(content);

  const footer = el("footer", "page-footer");
  footer.append(el("span", "footer-label", slide.footer || ""));
  footer.append(el("span", "page-number", `${pageNumber} / ${pageCount}`));
  page.appendChild(footer);

  return page;
}

function template(slide) {
  switch (slide.template) {
    case "cover":
      return stack([
        image("cover-logo", slide.logo, slide.logoAlt || slide.title),
        text("div", "kicker", slide.kicker),
        text("h1", "cover-title", slide.title),
        text("p", "cover-subtitle", slide.subtitle),
        text("p", "cover-meta", slide.meta)
      ], "cover-layout");
    case "section":
      return stack([
        text("div", "section-label", slide.label),
        text("h1", "section-title", slide.title),
        text("p", "section-subtitle", slide.subtitle)
      ], "section-layout");
    case "statement":
      return stack([
        text("div", "kicker", slide.kicker),
        text("h1", "statement-title", slide.title),
        text("p", "statement-body", slide.body)
      ], "statement-layout");
    case "bullets":
      return stack([
        text("h1", "page-title", slide.title),
        text("p", "intro", slide.intro),
        list(slide.bullets, "bullet-list")
      ], "standard-layout");
    case "two-column":
      return stack([
        text("h1", "page-title", slide.title),
        columns([
          panel(slide.left?.heading, slide.left?.bullets),
          panel(slide.right?.heading, slide.right?.bullets)
        ])
      ], "standard-layout");
    case "comparison":
      return stack([
        text("h1", "page-title", slide.title),
        table(slide.columns, slide.rows)
      ], "standard-layout");
    case "metrics":
      return stack([
        text("h1", "page-title", slide.title),
        metrics(slide.metrics)
      ], "standard-layout");
    case "timeline":
      return stack([
        text("h1", "page-title", slide.title),
        timeline(slide.events)
      ], "standard-layout");
    case "closing":
      return stack([
        text("h1", "closing-title", slide.title),
        text("p", "closing-note", slide.note),
        text("p", "closing-contact", slide.contact)
      ], "closing-layout");
    default:
      return stack([
        text("h1", "page-title", "Unsupported template"),
        text("p", "intro", `Template "${slide.template}" is not registered.`)
      ], "standard-layout");
  }
}

function panel(heading, bullets) {
  const node = el("section", "panel");
  node.appendChild(text("h2", "panel-title", heading));
  node.appendChild(list(bullets, "panel-list"));
  return node;
}

function columns(children) {
  const node = el("div", "columns");
  children.forEach((child) => node.appendChild(child));
  return node;
}

function table(columnsData = [], rows = []) {
  const node = el("table", "comparison-table");
  const thead = el("thead");
  const headRow = el("tr");
  columnsData.forEach((column) => headRow.appendChild(text("th", "", column)));
  thead.appendChild(headRow);
  node.appendChild(thead);

  const tbody = el("tbody");
  rows.forEach((row) => {
    const tr = el("tr");
    row.forEach((cell) => tr.appendChild(text("td", "", cell)));
    tbody.appendChild(tr);
  });
  node.appendChild(tbody);
  return node;
}

function metrics(items = []) {
  const node = el("div", "metrics-grid");
  items.forEach((item) => {
    const metric = el("section", "metric");
    metric.appendChild(text("div", "metric-value", item.value));
    metric.appendChild(text("div", "metric-label", item.label));
    metric.appendChild(text("p", "metric-note", item.note));
    node.appendChild(metric);
  });
  return node;
}

function timeline(events = []) {
  const node = el("ol", "timeline");
  events.forEach((event) => {
    const item = el("li", "timeline-item");
    item.appendChild(text("div", "timeline-label", event.label));
    item.appendChild(text("h2", "timeline-title", event.title));
    item.appendChild(text("p", "timeline-body", event.body));
    node.appendChild(item);
  });
  return node;
}

function list(items = [], className) {
  const node = el("ul", className);
  items.forEach((item) => node.appendChild(text("li", "", item)));
  return node;
}

function stack(children, className) {
  const node = el("div", className);
  children.filter(Boolean).forEach((child) => node.appendChild(child));
  return node;
}

function text(tag, className, value) {
  if (!value) return null;
  const node = el(tag, className);
  node.textContent = value;
  return node;
}

function image(className, src, alt = "") {
  if (!src) return null;
  const node = el("img", className);
  node.src = src;
  node.alt = alt;
  return node;
}

function el(tag, className = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
