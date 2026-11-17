"use client";

import { useMemo, useState } from "react";

type Mission = {
  id: string;
  number: string;
  title: string;
  items: Item[];
};

type Item =
  | { id: string; label: string; points: number; kind?: "check" }
  | { id: string; label: string; points: number; kind: "count"; max: number }
  | {
      id: string;
      label: string;
      kind: "choice";
      options: { label: string; points: number }[];
    };

const missions: Mission[] = [
  {
    id: "m01",
    number: "01",
    title: "Drohnen-Überflug",
    items: [
      { id: "drone", label: "Drohne berührt die Matte nicht mehr", points: 20 },
      { id: "lidar", label: "LiDAR-Karte vollständig umgedreht, Scanmarker im Messgebiet", points: 10 },
    ],
  },
  {
    id: "m02",
    number: "02",
    title: "Explodierende Samen",
    items: [{ id: "seeds", label: "Samen berühren den Stängel nicht mehr", points: 10, kind: "count", max: 2 }],
  },
  {
    id: "m03",
    number: "03",
    title: "Felsen umdrehen",
    items: [
      { id: "flag", label: "Forschungsflagge ist unten", points: 20 },
      { id: "rock", label: "Felsen in die ursprüngliche Position zurückgelegt", points: 10 },
    ],
  },
  {
    id: "m04",
    number: "04",
    title: "Glückliche Blätter",
    items: [
      { id: "leaf", label: "Ein Blatt vollständig aus dem Nest entfernt", points: 10 },
      { id: "leafBonus", label: "Zweites Blatt entfernt und Laubheuschrecke in Startposition", points: 20 },
    ],
  },
  {
    id: "m05",
    number: "05",
    title: "Wurzeln erreichen",
    items: [
      {
        id: "root",
        label: "Wurzel ist …",
        kind: "choice",
        options: [
          { label: "Nicht ausgefahren", points: 0 },
          { label: "Teilweise ausgefahren", points: 10 },
          { label: "Vollständig ausgefahren", points: 20 },
        ],
      },
    ],
  },
  {
    id: "m06",
    number: "06",
    title: "Blattschneider-Ameisen",
    items: [
      { id: "fragments", label: "Blattfragmente im Nest (je 10 Punkte)", points: 10, kind: "count", max: 3 },
    ],
  },
  {
    id: "m07",
    number: "07",
    title: "Riesiger Pilz",
    items: [
      { id: "mycelium", label: "Myzel vollständig ausgefahren", points: 20 },
      { id: "connection", label: "Verbindung zum vollständig ausgefahrenen Pflanzenwurzelsystem", points: 10 },
    ],
  },
  {
    id: "m08",
    number: "08",
    title: "Verflochten",
    items: [{ id: "vine", label: "Ranke berührt die Matte", points: 30 }],
  },
  {
    id: "m09",
    number: "09",
    title: "Forschungsplattform",
    items: [
      { id: "platform", label: "Forschungsplattform angehoben", points: 10 },
      { id: "camera", label: "Kamerafalle ausgebracht", points: 10 },
      { id: "seed", label: "Samen berührt den Baum nicht mehr", points: 10 },
    ],
  },
  {
    id: "m10",
    number: "10",
    title: "Empfindliche Lebensräume",
    items: [
      { id: "spider", label: "Spinnen-Lebensraum in ursprünglicher Position", points: 10 },
      { id: "snail", label: "Schnecken-Lebensraum in ursprünglicher Position", points: 10 },
    ],
  },
  {
    id: "m11",
    number: "11",
    title: "Fenster in die Vergangenheit",
    items: [{ id: "window", label: "Wurzelabdeckung liegt unten und berührt die Matte", points: 20 }],
  },
  {
    id: "m12",
    number: "12",
    title: "Waldältester",
    items: [
      { id: "cane", label: "Stütze vollständig angehoben und berührt den Baum", points: 20 },
      { id: "tie", label: "Stützband liegt um den Pfosten", points: 10 },
    ],
  },
  {
    id: "m13",
    number: "13",
    title: "Schlüsselart",
    items: [{ id: "species", label: "Schlüsselart auf der Wiederherstellungsplattform, junge Bäume angehoben", points: 30 }],
  },
  {
    id: "m14",
    number: "14",
    title: "Samen der Erneuerung",
    items: [
      { id: "renewalSeeds", label: "Samen in der Wiederbepflanzungsstation (je 5 Punkte)", points: 5, kind: "count", max: 3 },
      { id: "renewalBonus", label: "Samen berühren zusätzlich die Matte (je 5 Bonuspunkte)", points: 5, kind: "count", max: 3 },
    ],
  },
  {
    id: "m15",
    number: "15",
    title: "Biozentrische Architektur",
    items: [
      { id: "canopy", label: "Nistdach angehoben", points: 10 },
      { id: "skylight", label: "Gartenoberlicht vollständig eingefahren", points: 10 },
      { id: "compost", label: "Kompostklappe vollständig geöffnet und berührt die Matte", points: 10 },
      {
        id: "environment",
        label: "Ökologischer Bonus: größter Bedarf des Docks erfüllt",
        kind: "choice",
        options: [
          { label: "Kein Bonus", points: 0 },
          { label: "Bonus erfüllt", points: 10 },
        ],
      },
    ],
  },
];

const precisionPoints = [0, 10, 15, 25, 35, 50, 50];

type Values = Record<string, boolean | number>;
type Choices = Record<string, number>;

export default function Home() {
  const [values, setValues] = useState<Values>({});
  const [choices, setChoices] = useState<Choices>({});
  const [tokens, setTokens] = useState(6);
  const [darkMode, setDarkMode] = useState(false);

  const score = useMemo(() => {
    const missionScores = missions.map((mission) => {
      const points = mission.items.reduce((sum, item) => {
        if (item.kind === "choice") return sum + (item.options[choices[item.id] ?? 0]?.points ?? 0);
        if (item.kind === "count") return sum + Math.min(Number(values[item.id] ?? 0), item.max) * item.points;
        return sum + (values[item.id] ? item.points : 0);
      }, 0);
      return { id: mission.id, points };
    });
    const missionsTotal = missionScores.reduce((sum, mission) => sum + mission.points, 0);
    const precision = precisionPoints[tokens];
    return { missionScores, missionsTotal, precision, total: missionsTotal + precision };
  }, [choices, tokens, values]);

  const setValue = (id: string, value: boolean | number) => setValues((current) => ({ ...current, [id]: value }));
  const setChoice = (id: string, value: number) => setChoices((current) => ({ ...current, [id]: value }));

  return (
    <main className={`page-shell ${darkMode ? "dark-mode" : ""}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">FIRST LEGO League Challenge · Saison 2026/27</p>
          <h1>BIOGLOW<span>™</span> Punkte-Rechner</h1>
          <p className="intro">Tragt eure Ergebnisse ein und behaltet eure Robot-Game-Punktzahl im Blick.</p>
        </div>
        <div className="hero-actions">
          <button className="theme-toggle" type="button" onClick={() => setDarkMode((current) => !current)} aria-pressed={darkMode}>
            {darkMode ? "Heller Modus" : "Dunkler Modus"}
          </button>
          <div className="score-panel" aria-live="polite">
            <span>Gesamtpunktzahl</span>
            <strong>{score.total}</strong>
            <small>{score.missionsTotal} Missionen · {score.precision} Präzisionspunkte</small>
          </div>
        </div>
      </header>

      <section className="content-grid">
        <div className="mission-list">
          {missions.map((mission, index) => {
            const missionScore = score.missionScores[index].points;
            const max = mission.items.reduce((sum, item) => {
              if (item.kind === "choice") return sum + Math.max(...item.options.map((option) => option.points));
              if (item.kind === "count") return sum + item.points * item.max;
              return sum + item.points;
            }, 0);
            const status = missionScore === 0 ? "empty" : missionScore === max ? "complete" : "partial";
            return (
              <article className={`mission-card ${status}`} key={mission.id}>
                <div className="mission-heading">
                  <div className="mission-number">{mission.number}</div>
                  <div>
                    <h2>Mission {mission.number}</h2>
                    <h3>{mission.title}</h3>
                  </div>
                  <div className="mission-score"><strong>{missionScore}</strong><span> / {max}</span></div>
                </div>
                <div className="mission-items">
                  {mission.items.map((item) => {
                    if (item.kind === "choice") {
                      return (
                        <fieldset key={item.id}>
                          <legend>{item.label}</legend>
                          <div className="choice-list">
                            {item.options.map((option, optionIndex) => (
                              <label className="choice" key={option.label}>
                                <input
                                  type="radio"
                                  name={item.id}
                                  checked={(choices[item.id] ?? 0) === optionIndex}
                                  onChange={() => setChoice(item.id, optionIndex)}
                                />
                                <span>{option.label}</span><b>+{option.points}</b>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      );
                    }
                    if (item.kind === "count") {
                      return (
                        <label className="count-row" key={item.id}>
                          <span>{item.label}</span>
                          <input type="number" min={0} max={item.max} value={Number(values[item.id] ?? 0)} onChange={(event) => setValue(item.id, Math.max(0, Math.min(item.max, Number(event.target.value))))} />
                          <b>× {item.points}</b>
                        </label>
                      );
                    }
                    return (
                      <label className="check-row" key={item.id}>
                        <input type="checkbox" checked={Boolean(values[item.id])} onChange={(event) => setValue(item.id, event.target.checked)} />
                        <span>{item.label}</span><b>+{item.points}</b>
                      </label>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="sidebar">
          <section className="precision-card">
            <p className="eyebrow">Zusatzwertung</p>
            <h2>Präzisionsmarken</h2>
            <p>Wie viele Marken sind am Ende des Matches noch auf dem Spielfeld?</p>
            <div className="token-control">
              <button type="button" onClick={() => setTokens(Math.max(0, tokens - 1))} aria-label="Eine Präzisionsmarke entfernen">−</button>
              <strong>{tokens}</strong>
              <button type="button" onClick={() => setTokens(Math.min(6, tokens + 1))} aria-label="Eine Präzisionsmarke hinzufügen">+</button>
            </div>
            <div className="token-points"><span>Präzisionspunkte</span><strong>{score.precision}</strong></div>
          </section>
          <section className="summary-card">
            <h2>Zusammenfassung</h2>
            <div><span>Missionen</span><strong>{score.missionsTotal}</strong></div>
            <div><span>Präzisionsmarken</span><strong>{score.precision}</strong></div>
            <div className="summary-total"><span>Gesamt</span><strong>{score.total}</strong></div>
          </section>
          <p className="source-note">Grundlage: Robot-Game-Regeln BIOGLOW™ 2026/27. Maßgeblich sind immer die offiziellen Regeln und die Entscheidung der Schiedsrichter:innen.</p>
        </aside>
      </section>
    </main>
  );
}
