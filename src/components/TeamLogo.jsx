import { useEffect } from 'react';
import { fetchTeamLogo, getTeamInitials } from '../utils/teamUtils';

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
};

const TeamLogo = ({ teamName, logoState, setLogoState, size = 'md' }) => {
  const box = sizeClasses[size] || sizeClasses.md;
  const spinSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const cleanName = (teamName || "").toLowerCase().trim();
  const initials = getTeamInitials(teamName || "");
  const logoData = logoState[cleanName];

  useEffect(() => {
    if (!cleanName || logoData) return;

    const loadLogo = async () => {
      setLogoState((prev) => ({
        ...prev,
        [cleanName]: { loading: true, url: null, error: false },
      }));

      try {
        const logoUrl = await fetchTeamLogo(teamName);

        setLogoState((prev) => ({
          ...prev,
          [cleanName]: { loading: false, url: logoUrl, error: !logoUrl },
        }));
      } catch (error) {
        setLogoState((prev) => ({
          ...prev,
          [cleanName]: { loading: false, url: null, error: true },
        }));
      }
    };

    loadLogo();
  }, [cleanName, teamName, logoData, setLogoState]);

  if (!logoData || logoData.loading) {
    return (
      <div className={`${box} flex shrink-0 items-center justify-center`}>
        <div className={`${spinSize} rounded-full border border-green-400 border-t-transparent animate-spin`} />
      </div>
    );
  }

  if (logoData.url && !logoData.error) {
    return (
      <div className={`${box} flex shrink-0 items-center justify-center`}>
        <img
          src={logoData.url}
          alt={teamName || "Team"}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          loading="lazy"
          onError={(e) => {
            console.log(`Logo yüklenemedi: ${teamName} - ${logoData.url}`);
            setLogoState((prev) => ({
              ...prev,
              [cleanName]: { loading: false, url: null, error: true },
            }));
          }}
          onLoad={() => {
            console.log(`Logo yüklendi: ${teamName}`);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-slate-700 ${
        size === 'sm' ? 'text-sm' : 'text-lg'
      }`}
    >
      <span className="text-white">⚽</span>
    </div>
  );
};

export default TeamLogo;