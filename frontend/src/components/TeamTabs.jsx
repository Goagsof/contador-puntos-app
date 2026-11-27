// From Uiverse.io by german_7619 - https://uiverse.io/german_7619/brown-sloth-50
// MIT License, Copyright (c) Spacious74 (VishalS), german_7619 (German Rozó)
// Adaptado a React + sistema de temas del proyecto.

export default function TeamTabs({ leaders, selectedUid, onChange }) {
  return (
    <div className="team-tabs">
      {leaders.map((leader) => (
        <label key={leader.id} className="team-tab">
          <input
            type="radio"
            name="team-tab"
            checked={selectedUid === leader.id}
            onChange={() => onChange(leader.id)}
          />
          <span className="team-tab-name">
            <span className="team-tab-corner team-tab-corner-left" />
            <span className="team-tab-corner team-tab-corner-right" />
            <span>{leader.name || 'Sin nombre'}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
