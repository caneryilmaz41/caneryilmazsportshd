import React from 'react';

const SportsWidgets = () => {
  return (
    <div className="sports-widgets">
      {/* ScoreAxis Widget */}
      <div className="widget-container">
        <h3>Canlı Maçlar & Fikstür</h3>
        <iframe 
          src="https://www.scoreaxis.com/widget/matches-v2/" 
          width="100%" 
          height="600"
          frameBorder="0"
          title="ScoreAxis Canlı Skorlar"
        />
      </div>

      {/* ScoreAxis Lig Tablosu */}
      <div className="widget-container">
        <h3>Lig Tablosu</h3>
        <iframe 
          src="https://www.scoreaxis.com/widget/standings/" 
          width="100%" 
          height="400"
          frameBorder="0"
          title="ScoreAxis Lig Tablosu"
        />
      </div>
    </div>
  );
};

export default SportsWidgets;