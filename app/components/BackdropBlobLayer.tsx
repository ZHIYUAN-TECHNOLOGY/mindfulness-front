export function BackdropBlobLayer() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-28 -left-36 w-[44rem] h-[44rem] rounded-full bg-[#f5d78e]/35 blur-3xl animate-[blobFloat_22s_ease-in-out_infinite]" />
      <div className="absolute top-64 -right-36 w-[40rem] h-[40rem] rounded-full bg-[#c79316]/24 blur-3xl animate-[blobFloat_28s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-24 left-1/3 w-[32rem] h-[32rem] rounded-full bg-[#ffe7b7]/45 blur-3xl animate-[blobFloat_25s_ease-in-out_infinite]" />
    </div>
  );
}

