import { useEffect, useState } from 'react';

export function useAssetExists(url) {
  const [exists, setExists] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    setChecked(false);
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (!active) return;
        setExists(res.ok);
        setChecked(true);
      })
      .catch(() => {
        if (!active) return;
        setExists(false);
        setChecked(true);
      });
    return () => { active = false; };
  }, [url]);

  return { exists, checked };
}
