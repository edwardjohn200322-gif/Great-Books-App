import { useEffect, useRef, useState, type MouseEvent } from "react";
import { books, favoriteOverview, reflections, summary } from "./content";

function Icon({ name = "arrow", size = 20 }: { name?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "book" ? (
        <>
          <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Z" />
          <path d="M12 5v15" />
        </>
      ) : name === "close" ? (
        <path d="m6 6 12 12M6 18 18 6" />
      ) : name === "menu" ? (
        <path d="M4 7h16M4 12h16M4 17h16" />
      ) : name === "plus" ? (
        <path d="M5 12h14M12 5v14" />
      ) : name === "spark" ? (
        <>
          <path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z" />
          <path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5L20 2Z" />
        </>
      ) : name === "leaf" ? (
        <>
          <path d="M19 4C7 2 1 13 8 17c7 5 12-4 11-13Z" />
          <path d="M5 21 16 8" />
        </>
      ) : name === "globe" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </>
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

const navigation = [
  { id: "profile", label: "Student Profile" },
  { id: "analyses", label: "Literary Analyses" },
  { id: "favorite", label: "My Favorite" },
  { id: "learning", label: "Summary of Learning" },
  { id: "reflection", label: "Personal Reflection" },
];

function BookCover({ index, large = false }: { index: number; large?: boolean }) {
  const book = books[index];
  return (
    <div className={`book-cover ${book.color} ${large ? "large" : ""}`} aria-hidden="true">
      <div className="cover-border">
        <span className="cover-tradition">{book.tradition}</span>
        <div className={`cover-ornament ornament-${index}`}>
          <Icon
            name={index === 1 || index === 6 ? "leaf" : index === 5 ? "globe" : "spark"}
            size={57}
          />
        </div>
        <span className="cover-title">{book.title}</span>
        <span className="cover-rule" />
        <span className="cover-author">
          {index === 0
            ? "FAITH · SUFFERING · WISDOM"
            : index === 4 || index === 5
              ? "HOMER"
              : index === 6
                ? "MURASAKI SHIKIBU"
                : index === 1
                  ? "VISHNU SHARMA"
                  : index === 2
                    ? "VALMIKI"
                    : "VYASA"}
        </span>
        <span className="cover-edition">THE GREAT BOOKS COLLECTION</span>
      </div>
    </div>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{number}</span> {eyebrow}
        </p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("profile");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const scrollTarget = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 110;
      if (scrollTarget.current !== null) {
        // Keep the chosen link highlighted while passing through other sections.
        if (Math.abs(window.scrollY - scrollTarget.current) > 2) return;
        scrollTarget.current = null;
      }
      const current = [...navigation]
        .reverse()
        .find(
          ({ id }) =>
            (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= offset + 2,
        );
      setActive(current?.id ?? "profile");
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };
    const interruptScroll = () => {
      scrollTarget.current = null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        interruptScroll();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll);
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", interruptScroll, { passive: true });
    window.addEventListener("touchstart", interruptScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    updateActiveSection();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", interruptScroll);
      window.removeEventListener("touchstart", interruptScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navigateToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 110;
    const top = Math.max(
      0,
      Math.min(
        window.scrollY + target.getBoundingClientRect().top - offset,
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    );
    scrollTarget.current = Math.abs(window.scrollY - top) > 2 ? top : null;
    setActive(id);
    setMenuOpen(false);
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  useEffect(() => {
    if (selected !== null) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
      dialog.current?.scrollTo(0, 0);
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  const openBook = (index: number) => setSelected(index);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="nav-shell">
          <a
            href="#profile"
            className="brand"
            aria-label="Great Books portfolio home"
            onClick={(event) => navigateToSection(event, "profile")}
          >
            <span className="brand-icon">
              <Icon name="book" size={23} />
            </span>
            <span>
              Great<span className="brand-italic">Books</span>
              <small>A LITERARY PORTFOLIO</small>
            </span>
          </a>
          <button
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <nav id="main-nav" className={menuOpen ? "open" : ""} aria-label="Main navigation">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? "active" : ""}
                aria-current={active === item.id ? "location" : undefined}
                onClick={(event) => navigateToSection(event, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">
        <section id="profile" className="profile-section page-width">
          <div className="hero">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="small-line" /> A STUDENT. A READER. A LIFELONG LEARNER.
              </p>
              <h1>
                John Edward
                <br />
                <span>M. Montanez</span>
                <span className="name-period">.</span>
              </h1>
              <p className="course">
                4th Year <span /> Bachelor of Science in
                <br className="desktop-break" /> Technology and Information
              </p>
              <p className="intro">
                I am fond of reading; it not only becomes an escape but also a safe place to explore
                something we couldn’t imagine.
              </p>
              <a
                className="primary-button"
                href="#analyses"
                onClick={(event) => navigateToSection(event, "analyses")}
              >
                Explore my literary analyses <Icon size={18} />
              </a>
              <div className="hero-footnote">
                <span>07 MASTERPIECES</span>
                <span className="tiny-dot" />
                <span>COUNTLESS PERSPECTIVES</span>
              </div>
            </div>
            <div className="portrait-area">
              <div className="portrait-visual">
                <div className="portrait-backdrop">
                  <span className="portrait-orbit orbit-one" />
                  <span className="portrait-orbit orbit-two" />
                  <span className="portrait-star">
                    <Icon name="spark" size={32} />
                  </span>
                </div>
                <div className="portrait-crop">
                  <img src="/assets/d06f5.png" alt="John Edward M. Montanez reading a book" />
                </div>
              </div>
              <div className="portrait-caption">
                <Icon name="book" size={18} />
                <span>Finding meaning, one page at a time.</span>
              </div>
              <span className="portrait-side-label">MY GREAT BOOKS JOURNEY</span>
            </div>
          </div>
          <div className="profile-panels">
            <article className="profile-panel">
              <span className="panel-icon">
                <Icon name="book" />
              </span>
              <div>
                <p className="eyebrow">BETWEEN THE PAGES</p>
                <h3>What draws me to literature</h3>
                <p>
                  I am particularly drawn to narratives centered on themes of maturity,
                  psychological depth, and tragedy. Engaging with these themes naturally prompts me
                  to reflect on my own life—examining how characters grow, the underlying nature of
                  their personalities, and the reasoning behind their choices. Ultimately, reading
                  these works offers a meaningful perspective that helps me discern the nuances
                  between fiction and reality.
                </p>
              </div>
            </article>
            <article className="profile-panel">
              <span className="panel-icon">
                <Icon name="spark" />
              </span>
              <div>
                <p className="eyebrow">TURNING A NEW CHAPTER</p>
                <h3>My hopes for Great Books</h3>
                <p>
                  I aim to deepen my understanding of how literary works shape personal perspectives
                  and human insight. By drawing on my passion for reading, I hope to refine my
                  critical thinking and cultivate a more analytical approach to reading and
                  interpreting texts.
                </p>
                <span className="panel-signoff">Read with curiosity. Reflect with purpose.</span>
              </div>
            </article>
          </div>
        </section>

        <section id="analyses" className="analyses-section section-space">
          <div className="page-width">
            <SectionHeading
              number="02"
              eyebrow="THE READING COLLECTION"
              title="Seven works. New perspectives."
            >
              <p className="section-description">
                A compilation of seven literary analyses—
                <br />
                exploring timeless stories through different lenses.
              </p>
            </SectionHeading>
            <div className="collection-meta">
              <span>
                <Icon name="book" size={15} /> THE LITERARY ANALYSES
              </span>
              <span>01 — 07</span>
            </div>
            <div className="book-grid">
              {books.map((book, index) => (
                <article className="book-card" key={book.title}>
                  <button
                    className="book-image-button"
                    onClick={() => openBook(index)}
                    aria-label={`Read analysis of ${book.title}`}
                  >
                    <span className="book-number">0{index + 1}</span>
                    <BookCover index={index} />
                    <span className="book-open-icon">
                      <Icon size={18} />
                    </span>
                  </button>
                  <div className="book-info">
                    <p className="book-tradition">{book.tradition}</p>
                    <h3>{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    <div className="lens-list">
                      {book.lenses.map((lens) => (
                        <span key={lens}>{lens}</span>
                      ))}
                    </div>
                    <button className="read-link" onClick={() => openBook(index)}>
                      Read analysis <Icon size={17} />
                    </button>
                  </div>
                </article>
              ))}
              <aside className="collection-note">
                <span className="quote-mark">“</span>
                <p>
                  I am fond of reading; it not only becomes an escape but also a safe place to
                  explore something we couldn’t imagine.
                </p>
                <span className="note-rule" />
                <span className="eyebrow">A PERSONAL NOTE</span>
              </aside>
            </div>
          </div>
        </section>

        <section id="favorite" className="favorite-section page-width section-space">
          <SectionHeading
            number="03"
            eyebrow="THE STORY THAT STAYED WITH ME"
            title="My Favorite Literary Masterpiece"
          />
          <div className="favorite-layout">
            <div className="favorite-art">
              <span className="favorite-label">
                <Icon name="spark" size={15} /> A PERSONAL FAVORITE
              </span>
              <BookCover index={0} large />
              <span className="favorite-art-note">
                An enduring reflection on faith & the human spirit.
              </span>
            </div>
            <div className="favorite-copy">
              <p className="eyebrow">HEBREW WISDOM LITERATURE</p>
              <h3>The Book of Job</h3>
              <p className="favorite-author">Unknown author · Hebrew Bible</p>
              <div className="favorite-tags">
                <span>Faith</span>
                <span>Suffering</span>
                <span>Divine wisdom</span>
              </div>
              <h4>The work, at a glance</h4>
              <p>{favoriteOverview}</p>
              <h4>Why it holds a special place</h4>
              <p>
                This story made a huge impact on how I believe in God’s grace and divine power. It
                makes me believe that the challenges are part of his plans for me and challenge the
                faith I have in him.
              </p>
              <blockquote>
                I am amused how Job accepted both the good and bad things he experienced with the
                faith and believe to God, his faith never lose even though he lose everything he
                has.
              </blockquote>
              <button className="read-link" onClick={() => openBook(0)}>
                Revisit my analysis <Icon size={17} />
              </button>
            </div>
          </div>
        </section>

        <section id="learning" className="learning-section section-space">
          <div className="page-width">
            <SectionHeading
              number="04"
              eyebrow="LESSONS BEYOND THE TEXT"
              title="Summary of Learning"
            >
              <p className="section-description">
                What I carry with me from the course:
                <br />
                knowledge, perspective, and a deeper understanding.
              </p>
            </SectionHeading>
            <div className="learning-grid">
              {summary.map((item, index) => (
                <article className="learning-card" key={item.title}>
                  <div className="learning-card-top">
                    <span className="panel-icon">
                      <Icon name={["globe", "spark", "leaf", "book"][index]} size={23} />
                    </span>
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="learning-subtitle">{item.subtitle}</p>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="reflection" className="reflection-section page-width section-space">
          <div className="reflection-intro">
            <p className="eyebrow">
              <span>05</span> LOOKING BACK, MOVING FORWARD
            </p>
            <h2>
              Personal
              <br />
              Reflection
            </h2>
            <p className="section-description">
              A journey of reading, questioning,
              <br />
              and coming to understand.
            </p>
            <div className="reflection-quote">
              <span className="quote-mark">“</span>
              <p>Everything changes.</p>
              <span>ONE LASTING REALIZATION</span>
            </div>
          </div>
          <div className="reflection-list">
            {reflections.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>
                  <span className="reflection-number">0{index + 1}</span>
                  <h3>{item.question}</h3>
                  <span className="details-icon">
                    <Icon name="plus" size={18} />
                  </span>
                </summary>
                <p>{item.text}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="closing-note page-width">
          <Icon name="book" size={26} />
          <p>The course ends. The reading continues.</p>
          <span>GREAT BOOKS · A JOURNEY IN LITERATURE & SELF-DISCOVERY</span>
          <a href="#profile" onClick={(event) => navigateToSection(event, "profile")}>
            Back to the beginning <span>↑</span>
          </a>
        </div>
      </main>
      <footer>
        <div className="page-width">
          <span>John Edward M. Montanez</span>
          <span>Great Books · Literary Portfolio</span>
          <span>Written with reflection. Read with purpose.</span>
        </div>
      </footer>

      <dialog
        ref={dialog}
        className="analysis-dialog"
        aria-labelledby="analysis-title"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {selected !== null && (
          <div className="dialog-inner">
            <div className="dialog-top">
              <p className="eyebrow">
                LITERARY ANALYSIS <span>0{selected + 1} / 07</span>
              </p>
              <button
                className="close-button"
                autoFocus
                aria-label="Close analysis"
                onClick={() => setSelected(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="dialog-book-header">
              <BookCover index={selected} />
              <div>
                <p className="eyebrow">{books[selected].tradition}</p>
                <h2 id="analysis-title">{books[selected].title}</h2>
                <p className="dialog-author">{books[selected].author}</p>
                <p className="lens-label">LITERARY LENS APPLIED</p>
                <div className="lens-list">
                  {books[selected].lenses.map((lens) => (
                    <span key={lens}>{lens}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="analysis-body">
              <h3>My literary analysis</h3>
              <p>{books[selected].text}</p>
            </div>
            <div className="dialog-bottom">
              <button disabled={selected === 0} onClick={() => setSelected(selected - 1)}>
                <span>←</span> Previous work
              </button>
              <span>0{selected + 1} / 07</span>
              <button disabled={selected === 6} onClick={() => setSelected(selected + 1)}>
                Next work <Icon size={16} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
