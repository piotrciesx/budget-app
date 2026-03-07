"use client";

export default function Level2Section({
  isOpenLevel2,
  children
}) {
  if (!isOpenLevel2) return null;

  return (
    <div>
      {children}
    </div>
  );
}