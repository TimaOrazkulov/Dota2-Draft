import { useState } from 'react';
import { useHeroes } from './hooks/useHeroes';
import { Setup, type DraftConfig } from './components/Setup';
import { DraftBoard } from './components/DraftBoard';
import { AllPickBoard } from './components/AllPickBoard';
import { GsiBoard } from './components/GsiBoard';
import './App.css';

export default function App() {
  const { heroes, loading, error } = useHeroes();
  const [config, setConfig] = useState<DraftConfig | null>(null);
  const [boardKey, setBoardKey] = useState(0);

  if (loading) {
    return (
      <div className="app-state-screen">
        <p>Загружаем список героев из OpenDota…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-state-screen">
        <p>Не удалось загрузить героев: {error}</p>
        <p className="muted">Проверьте подключение к интернету и обновите страницу.</p>
      </div>
    );
  }

  const exitToSetup = () => {
    setConfig(null);
    setBoardKey((k) => k + 1);
  };

  if (config === null) {
    return <Setup onStart={setConfig} />;
  }

  if (config.mode === 'allpick') {
    return <AllPickBoard key={boardKey} heroes={heroes} myPosition={config.myPosition} onExit={exitToSetup} />;
  }

  if (config.mode === 'gsi') {
    return (
      <GsiBoard
        key={boardKey}
        heroes={heroes}
        myPosition={config.myPosition}
        myIsRadiant={config.myIsRadiant}
        onExit={exitToSetup}
      />
    );
  }

  return (
    <DraftBoard
      key={boardKey}
      heroes={heroes}
      myPosition={config.myPosition}
      mySideFirst={config.mySideFirst}
      onNewDraft={exitToSetup}
    />
  );
}
