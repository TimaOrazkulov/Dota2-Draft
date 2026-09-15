import type { Hero } from '../types';
import { generateGuide } from '../lib/guide';

interface Props {
  hero: Hero;
  enemyPicks: Hero[];
  onClose: () => void;
}

export function GuidePanel({ hero, enemyPicks, onClose }: Props) {
  const guide = generateGuide(hero, enemyPicks);

  return (
    <div className="guide-panel">
      <div className="guide-panel__head">
        <img src={hero.img} alt={hero.localizedName} className="guide-panel__hero-img" />
        <div>
          <h3>{guide.title}</h3>
          <p className="muted">{guide.roleLine}</p>
        </div>
        <button className="btn btn-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <section>
        <h4>Лайн</h4>
        <p>{guide.laning}</p>
      </section>
      <section>
        <h4>Порядок скиллов</h4>
        <p>{guide.skillOrder}</p>
      </section>
      <section>
        <h4>Стартовые предметы</h4>
        <p>{guide.startingItems}</p>
      </section>
      <section>
        <h4>Основной билд</h4>
        <p>{guide.coreItems}</p>
      </section>
      <section>
        <h4>Ситуативно (против текущего пула врагов)</h4>
        {guide.situationalItems.length === 0 ? (
          <p className="muted">Пока нет вражеских пиков — ситуативные предметы появятся по ходу драфта.</p>
        ) : (
          <ul>
            {guide.situationalItems.map((it) => (
              <li key={it.item}>
                <strong>{it.item}</strong> — {it.reason}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4>Тайминги / комбо</h4>
        <p>{guide.combo}</p>
      </section>
    </div>
  );
}
