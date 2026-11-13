// src/components/ui/Spotlight.tsx
import { Spotlight, spotlight, type SpotlightActionData } from '@mantine/spotlight';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

type AppSpotlightProps = {
  actions: SpotlightActionData[];
  placeholder?: string;
  shortcut?: string | string[];
  limit?: number;
};

export function AppSpotlight({
  actions,
  placeholder = 'Search Products...',
  shortcut = ['mod + K', '/'],
  limit = 10,
}: AppSpotlightProps) {
  return (
    <Spotlight
      actions={actions}
      shortcut={shortcut}
      limit={limit}
      nothingFound="Nothing found..."
      highlightQuery
      scrollable
      maxHeight={400}
      searchProps={{
        leftSection: <MagnifyingGlassIcon size={20} />,
        placeholder,
      }}
    />
  );
}

// re-export so other components can open/close it without importing Mantine directly
export { spotlight };