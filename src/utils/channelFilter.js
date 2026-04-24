/** Maç satırı gibi görünenleri hariç tut; sol paneldeki TV listesiyle aynı kural. */
export function isStreamChannelEntry(channel) {
  if (!channel) return false;
  const name = channel.name?.toLowerCase() || "";
  const hasVs = name.includes(" vs ") || name.includes(" - ") || name.includes(" x ");
  const hasTeamNames =
    name.includes("galatasaray") ||
    name.includes("fenerbahçe") ||
    name.includes("beşiktaş") ||
    name.includes("trabzonspor");
  const isChannel =
    name.includes("tv") ||
    name.includes("spor") ||
    name.includes("kanal") ||
    name.includes("sport");
  const isBelgesel =
    channel.category === "belgesel" ||
    Boolean(channel.hlsUrl) ||
    /belgesel|geographic|nat\s*geo|documentary|viasat|tarih\s*tv|natural|çiftçi|tarım|tarih|cgtn|wild|explore/i.test(
      name
    );
  return !hasVs && !hasTeamNames && (isChannel || channel.status?.includes("/") || isBelgesel);
}

export function getFilteredChannels(channels) {
  return (channels || []).filter(isStreamChannelEntry);
}
