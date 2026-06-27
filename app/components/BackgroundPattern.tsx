export function BackgroundPattern() {
  const patternSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><g fill='%23C89212' fill-opacity='0.04'><polygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/></g></svg>`
  );

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundColor: "#E8BE51",
        backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "44px 44px",
      }}
    />
  );
}
