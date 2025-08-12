export function DisplayVideo({
  video,
  asGif,
}: {
  video: string;
  asGif: boolean;
}) {
  if (asGif) {
    return <img src={video} alt="Latest Video" />;
  }
  return <video src={video} />;
}
