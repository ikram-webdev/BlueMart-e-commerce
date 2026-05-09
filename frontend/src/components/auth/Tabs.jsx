function Tabs({ activeTab, onTabChange, tabs }) {
  return (
    <div className="auth-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`auth-tab-btn ${activeTab === tab.key ? "active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
