export const SLOGAN = 'kalitenin beşiği';

/* Marka sloganı: altın-zümrüt ışıltılı yazı, isteğe bağlı yan çizgiler */
const Slogan = ({ className = '', lines = true }) => (
  <span className={`slogan ${className}`}>
    {lines ? <span className="slogan-line" aria-hidden /> : null}
    <span className="slogan-text">{SLOGAN}</span>
    {lines ? <span className="slogan-line slogan-line-r" aria-hidden /> : null}
  </span>
);

export default Slogan;
