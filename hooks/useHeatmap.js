import { useState, useMemo } from "react";

export default function useHeatmap() {

  const [heatmapMode, setHeatmapMode] = useState("usage");
  const [isEditingThresholds, setIsEditingThresholds] = useState(false);

  const [heatmapSettings, setHeatmapSettings] = useState({
    usage: [1, 3, 5],
    amount: [50, 200, 500]
  });

  const [tempThresholds, setTempThresholds] = useState({
    usage: [1, 3, 5],
    amount: [50, 200, 500]
  });

  const activeThresholds = useMemo(() => {
    return heatmapSettings[heatmapMode];
  }, [heatmapSettings, heatmapMode]);

  return {
    heatmapMode,
    setHeatmapMode,
    isEditingThresholds,
    setIsEditingThresholds,
    heatmapSettings,
    setHeatmapSettings,
    tempThresholds,
    setTempThresholds,
    activeThresholds
  };
}