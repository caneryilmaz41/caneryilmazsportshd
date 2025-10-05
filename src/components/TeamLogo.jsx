import { useEffect } from 'react';
import { fetchTeamLogo, getTeamInitials } from '../utils/teamUtils';

const TeamLogo = ({ teamName, logoState, setLogoState }) => {
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
      <div className="w-10 h-10 flex items-center justify-center">
        <div className="w-5 h-5 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (logoData.url && !logoData.error) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
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
    <div className="w-10 h-10 flex items-center justify-center">
      <span className="text-white text-sm font-bold tracking-tight">
        {initials}
      </span>
    </div>
  );
};

export default TeamLogo;