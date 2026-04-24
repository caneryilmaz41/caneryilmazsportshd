import { useEffect, useState, useMemo, useCallback } from 'react';
import { getChannelLogoSources } from '../utils/channelUtils';

const Placeholder = ({ className, compact }) => (
  <div
    className={`flex items-center justify-center bg-slate-800/80 text-slate-500 ${
      compact ? 'h-5 w-5 rounded text-[9px]' : 'h-7 w-7 rounded-md text-[10px] font-bold'
    } ${className || ''}`}
    aria-hidden
  >
    TV
  </div>
);

const ChannelLogoImg = ({ channelName, className = 'h-7 w-7 object-contain', compact = false }) => {
  const sources = useMemo(() => getChannelLogoSources(channelName), [channelName]);
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [channelName]);

  const onError = useCallback(() => {
    setI((v) => v + 1);
  }, []);

  if (sources.length === 0 || i >= sources.length) {
    return <Placeholder compact={compact} className={className} />;
  }

  return (
    <img
      src={sources[i]}
      alt=""
      className={className}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  );
};

export default ChannelLogoImg;
